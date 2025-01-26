/**
 * Handles chat operations and real-time updates for the medical intake chatbot.
 */
'use client'

import { createClient } from '@/utils/supabase/client'
import { 
  type MedicalMessage,
  type MedicalConversation,
  type MedicalConversationWithMessages,
  type UIMessage,
  type TypingStatus,
  type MessageStatus,
  type PresenceState,
  type ConversationId,
  type UserId,
  type MessageMetadata,
  isAIProcessingMetadata,
  isHandoffMetadata
} from '@/types/chat'
import { 
  messageSchema, 
  messageInsertSchema,
  conversationSchema,
  metadataSchema,
  uiMessageSchema
} from '@/lib/validations/chat'

const supabase = createClient()

function logError(context: string, error: unknown, data?: any) {
  console.error(`[Chat Service] ${context}:`, {
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    data: JSON.stringify(data, null, 2)
  })
}

function logDebug(context: string, data?: any) {
  console.debug(`[Chat Service] ${context}:`, 
    typeof data === 'object' ? JSON.stringify(data, null, 2) : data
  )
}

function logWarning(context: string, data?: any) {
  console.warn(`[Chat Service] ${context}:`, 
    typeof data === 'object' ? JSON.stringify(data, null, 2) : data
  )
}

function castToConversationId(id: string): ConversationId {
  return id as ConversationId
}

function castToUserId(id: string): UserId {
  return id as UserId
}

/**
 * Subscribes to real-time updates for a conversation
 */
export function subscribeToConversation(
  conversationId: ConversationId,
  onMessage: (message: UIMessage) => void,
  onTyping: (status: TypingStatus) => void,
  onMessageStatus: (status: { messageId: string; status: MessageStatus }) => void,
  onPresence: (state: PresenceState) => void
) {
  logDebug('Subscribing to conversation', { conversationId })
  
  const channel = supabase
    .channel(`conversation:${conversationId}`)
    // Message inserts
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'medical_messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        try {
          logDebug('New message received', payload.new)
          // First validate as database type
          const dbMessage = messageSchema.parse(payload.new)
          // Then transform to UI message
          const message = uiMessageSchema.parse({
            ...dbMessage,
            conversation_id: castToConversationId(dbMessage.conversation_id),
            state: { status: 'sent', id: dbMessage.id },
            metadata: metadataSchema.parse(dbMessage.metadata)
          })
          onMessage(message)
        } catch (error) {
          logError('Failed to process new message', error, payload)
        }
      }
    )
    // Message status updates
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'medical_messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        try {
          logDebug('Message status update', payload.new)
          const dbMessage = messageSchema.parse(payload.new)
          const metadata = metadataSchema.parse(dbMessage.metadata)
          onMessageStatus({ 
            messageId: dbMessage.id, 
            status: metadata.status 
          })
        } catch (error) {
          logError('Failed to process message status update', error, payload)
        }
      }
    )
    // Typing indicators
    .on('broadcast', { event: 'typing' }, (payload) => {
      try {
        logDebug('Typing indicator', payload)
        const typingStatus = payload.payload as TypingStatus
        onTyping(typingStatus)
      } catch (error) {
        logError('Failed to process typing indicator', error, payload)
      }
    })
    // Track presence
    .on('presence', { event: 'sync' }, () => {
      try {
        const state = channel.presenceState()
        onPresence(state as unknown as PresenceState)
      } catch (error) {
        logError('Failed to process presence sync', error)
      }
    })

  return channel.subscribe(async (status) => {
    logDebug('Channel status changed', { status })
    if (status === 'SUBSCRIBED') {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await channel.track({
          user_id: castToUserId(user.id),
          online_at: new Date().toISOString()
        })
      }
    }
  })
}

/**
 * Sends a typing indicator
 */
export async function sendTypingIndicator(
  conversationId: ConversationId,
  isTyping: boolean
) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  return supabase
    .channel(`conversation:${conversationId}`)
    .send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        conversationId,
        isTyping,
        userId: user.id as UserId,
        timestamp: new Date().toISOString()
      }
    })
}

/**
 * Updates message status (delivered/read)
 */
export async function updateMessageStatus(
  messageId: string,
  status: MessageStatus
): Promise<void> {
  const { error } = await supabase
    .from('medical_messages')
    .update({
      metadata: {
        type: 'standard',
        status,
        updated_at: new Date().toISOString()
      }
    })
    .eq('id', messageId)

  if (error) throw error
}

/**
 * Sends a message in a conversation
 */
export async function sendMessage(
  content: string,
  conversationId: ConversationId,
  role: 'system' | 'user' | 'assistant' = 'user',
  metadata: MessageMetadata = { type: 'standard', status: 'sending' }
): Promise<UIMessage> {
  // Create temporary message for optimistic update
  const tempMessage: UIMessage = {
    id: crypto.randomUUID(),
    conversation_id: conversationId,
    content,
    role,
    created_at: new Date().toISOString(),
    metadata,
    state: { status: 'sending', tempId: crypto.randomUUID() }
  }

  try {
    // Get user role and verify access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data: userRole } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    // Verify conversation access
    const { data: conversation } = await supabase
      .from('medical_conversations')
      .select('patient_id, assigned_staff_id, case_id')
      .eq('id', conversationId)
      .single()

    if (!conversation) throw new Error('Conversation not found')

    // Check access based on role
    const hasAccess = 
      userRole?.role === 'admin' ||
      (userRole?.role === 'patient' && conversation.patient_id === user.id) ||
      (userRole?.role === 'staff' && (
        conversation.assigned_staff_id === user.id ||
        // Check case assignment
        await supabase
          .from('cases')
          .select('id')
          .eq('id', conversation.case_id)
          .eq('assigned_to', user.id)
          .maybeSingle()
          .then(({ data }) => !!data)
      ))

    if (!hasAccess) {
      throw new Error('No access to this conversation')
    }

    // Return the temporary message immediately for optimistic UI update
    setTimeout(() => {
      const channel = supabase.channel(`conversation:${conversationId}`)
      channel.send({
        type: 'broadcast',
        event: 'message',
        payload: tempMessage
      })
    }, 0)

    const response = await fetch(`/api/chat/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, role, metadata })
    })

    if (!response.ok) {
      throw new Error('Failed to send message')
    }

    const { success, data, error } = await response.json()
    
    if (!success || !data) {
      throw new Error(error || 'Failed to send message')
    }

    // Return the user message with updated state
    return {
      ...tempMessage,
      id: data.id,
      metadata: { ...metadata, status: 'delivered' },
      state: { status: 'sent', id: data.id }
    }
  } catch (error) {
    console.error('Failed to send message:', error)
    return {
      ...tempMessage,
      metadata: { ...metadata, status: 'error' },
      state: { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to send message'
      }
    }
  }
}

/**
 * Creates a new conversation
 */
export async function createConversation(patientId: UserId): Promise<MedicalConversation> {
  logDebug('Creating conversation', { 
    patientId,
    timestamp: new Date().toISOString()
  })

  try {
    // Get user role for access control logging
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      logError('Auth error getting user', {
        error: authError,
        timestamp: new Date().toISOString()
      })
      throw authError
    }

    if (!user) {
      logError('No authenticated user found', {
        timestamp: new Date().toISOString()
      })
      throw new Error('No authenticated user')
    }

    logDebug('Auth state', {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        aud: user.aud,
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata
      },
      timestamp: new Date().toISOString()
    })

    const { data: userRole, error: roleError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (roleError) {
      logError('Error fetching user role', {
        error: roleError,
        userId: user.id,
        timestamp: new Date().toISOString()
      })
      throw roleError
    }

    logDebug('User context for conversation creation', {
      userId: user.id,
      userRole: userRole?.role,
      isCreatingForSelf: user.id === patientId,
      timestamp: new Date().toISOString()
    })

    // First create the conversation
    const { data: newConversation, error: insertError } = await supabase
      .from('medical_conversations')
      .insert({
        patient_id: patientId,
        status: 'active',
        metadata: {}
      })
      .select('*')
      .single()

    if (insertError) {
      logError('Database error creating conversation', {
        error: {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          full: JSON.stringify(insertError, null, 2)
        },
        context: { 
          patientId,
          query: {
            table: 'medical_conversations',
            operation: 'insert',
            data: {
              patient_id: patientId,
              status: 'active',
              metadata: {}
            }
          },
          userContext: {
            userId: user?.id,
            userRole: userRole?.role,
            isCreatingForSelf: user?.id === patientId
          }
        },
        timestamp: new Date().toISOString()
      })
      throw insertError
    }

    if (!newConversation) {
      logError('No conversation returned after creation', null, {
        patientId,
        timestamp: new Date().toISOString()
      })
      throw new Error('No conversation returned after creation')
    }

    logDebug('Initial conversation created', {
      conversationId: newConversation.id,
      timestamp: new Date().toISOString()
    })

    // Then fetch the full conversation with all fields
    const { data: fullConversation, error: fetchError } = await supabase
      .from('medical_conversations')
      .select(`
        id,
        patient_id,
        assigned_staff_id,
        case_id,
        can_create_case,
        created_at,
        updated_at,
        status,
        topic,
        metadata
      `)
      .eq('id', castToConversationId(newConversation.id))
      .single()

    if (fetchError) {
      logError('Error fetching created conversation', fetchError, { 
        conversationId: newConversation.id,
        errorCode: fetchError.code,
        errorMessage: fetchError.message,
        errorDetails: fetchError.details,
        timestamp: new Date().toISOString()
      })
      throw fetchError
    }

    if (!fullConversation) {
      logError('Could not fetch created conversation', null, {
        conversationId: newConversation.id,
        timestamp: new Date().toISOString()
      })
      throw new Error('Could not fetch created conversation')
    }

    logDebug('Full conversation fetched', {
      conversationId: fullConversation.id,
      canCreateCase: fullConversation.can_create_case,
      hasCase: !!fullConversation.case_id,
      timestamp: new Date().toISOString()
    })

    const parsedConversation = conversationSchema.parse({
      ...fullConversation,
      id: castToConversationId(fullConversation.id),
      patient_id: castToUserId(fullConversation.patient_id),
      assigned_staff_id: fullConversation.assigned_staff_id ? castToUserId(fullConversation.assigned_staff_id) : null
    })

    logDebug('Conversation created successfully', {
      conversationId: parsedConversation.id,
      canCreateCase: parsedConversation.can_create_case,
      hasCase: !!parsedConversation.case_id,
      timestamp: new Date().toISOString()
    })

    return parsedConversation
  } catch (error) {
    logError('Failed to create conversation', error, {
      patientId,
      errorType: error instanceof Error ? error.name : typeof error,
      timestamp: new Date().toISOString()
    })
    throw new Error('Failed to create conversation')
  }
}

/**
 * Fetches messages for a conversation with pagination
 */
export async function getMessages(
  conversationId: ConversationId,
  page = 1,
  limit = 20
): Promise<MedicalMessage[]> {
  const response = await fetch(
    `/api/chat/${conversationId}/messages?page=${page}&limit=${limit}`,
    { method: 'GET' }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch messages')
  }

  const { success, data, error } = await response.json()
  if (!success || !data) {
    throw new Error(error || 'Failed to fetch messages')
  }

  return data
}

/**
 * Updates a conversation's status
 */
export async function updateConversationStatus(
  conversationId: ConversationId,
  status: 'active' | 'archived'
): Promise<void> {
  const response = await fetch(`/api/chat/${conversationId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  })

  if (!response.ok) {
    throw new Error('Failed to update conversation status')
  }
}

/**
 * Fetches conversations for a patient
 */
export async function getConversations(
  patientId: UserId,
  page = 1,
  limit = 20,
  status?: 'active' | 'archived'
): Promise<MedicalConversationWithMessages[]> {
  logDebug('Fetching conversations', { 
    patientId, 
    page, 
    limit, 
    status,
    timestamp: new Date().toISOString()
  })

  try {
    // Get user role for access control logging
    const { data: { user } } = await supabase.auth.getUser()
    const { data: userRole } = await supabase
      .from('users')
      .select('role')
      .eq('id', user?.id)
      .single()

    logDebug('User context for fetching conversations', { 
      userId: user?.id,
      userRole: userRole?.role,
      isRequestingOwnData: user?.id === patientId,
      timestamp: new Date().toISOString()
    })

    // First get the conversations without messages
    let query = supabase
      .from('medical_conversations')
      .select(`
        id,
        patient_id,
        assigned_staff_id,
        case_id,
        can_create_case,
        created_at,
        updated_at,
        status,
        topic,
        metadata
      `)
      .order('updated_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    // Apply filters based on role and ownership
    if (userRole?.role === 'patient') {
      logDebug('Applying patient role filter', {
        userId: user?.id,
        timestamp: new Date().toISOString()
      })
      // Patients can only see their own conversations
      query = query.eq('patient_id', user?.id)
    } else if (userRole?.role === 'staff') {
      logDebug('Applying staff role filter', {
        userId: user?.id,
        timestamp: new Date().toISOString()
      })
      // Staff can see conversations they're assigned to or from their cases
      query = query.or(`assigned_staff_id.eq.${user?.id},case_id.in.(${
        supabase
          .from('cases')
          .select('id')
          .eq('assigned_to', user?.id)
          .then(({ data }) => data?.map(c => c.id).join(','))
      })`)
    } else if (userRole?.role === 'admin') {
      logDebug('Admin access - no filters applied', {
        userId: user?.id,
        timestamp: new Date().toISOString()
      })
    } else {
      logWarning('Unknown user role - no access granted', {
        userId: user?.id,
        userRole: userRole?.role,
        timestamp: new Date().toISOString()
      })
      return []
    }

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status)
    }

    const { data: conversations, error: conversationsError } = await query

    if (conversationsError) {
      logError('Database error fetching conversations', conversationsError, {
        query: {
          patientId,
          status: status || 'active',
          range: [(page - 1) * limit, page * limit - 1]
        },
        errorCode: conversationsError.code,
        errorMessage: conversationsError.message,
        errorDetails: conversationsError.details,
        timestamp: new Date().toISOString()
      })
      throw conversationsError
    }

    logDebug('Raw conversations fetched', {
      count: conversations?.length || 0,
      conversationIds: conversations?.map(c => c.id),
      timestamp: new Date().toISOString()
    })

    if (!conversations) {
      logWarning('No conversations found', { 
        patientId,
        userContext: { 
          userId: user?.id, 
          userRole: userRole?.role,
          isOwnData: user?.id === patientId 
        }
      })
      return []
    }

    // Then get messages for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conv) => {
        const { data: messages, error: messagesError } = await supabase
          .from('medical_messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: true })

        if (messagesError) {
          logError('Error fetching messages for conversation', messagesError, { conversationId: conv.id })
          return null
        }

        return {
          ...conv,
          id: castToConversationId(conv.id),
          patient_id: castToUserId(conv.patient_id),
          assigned_staff_id: conv.assigned_staff_id ? castToUserId(conv.assigned_staff_id) : null,
          messages: messages || [],
          unread_count: messages?.filter(m => m.metadata?.status !== 'read').length || 0
        }
      })
    )

    // Filter out any failed fetches and validate
    const validConversations = conversationsWithMessages
      .filter((conv): conv is NonNullable<typeof conv> => conv !== null)
      .map(conv => {
        try {
          const parsed = conversationSchema.parse({
            ...conv,
            id: castToConversationId(conv.id),
            patient_id: castToUserId(conv.patient_id),
            assigned_staff_id: conv.assigned_staff_id ? castToUserId(conv.assigned_staff_id) : null
          })
          return parsed as MedicalConversationWithMessages
        } catch (error) {
          logError('Failed to validate conversation', error, {
            conversationId: conv.id,
            conversation: conv
          })
          return null
        }
      })
      .filter((conv): conv is NonNullable<typeof conv> => conv !== null)

    logDebug('Fetched and validated conversations', {
      totalCount: validConversations.length,
      conversations: validConversations.map(c => ({
        id: c.id,
        messageCount: c.messages.length,
        unreadCount: c.unread_count
      }))
    })

    return validConversations
  } catch (error) {
    logError('Failed to fetch conversations', error, { patientId, page, limit, status })
    throw new Error('Failed to fetch conversations')
  }
}

/**
 * Deletes a conversation
 */
export async function deleteConversation(conversationId: ConversationId): Promise<void> {
  const response = await fetch(`/api/chat/${conversationId}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw new Error('Failed to delete conversation')
  }
}

/**
 * Updates chat status in case metadata
 */
export async function updateChatStatus(
  caseId: string,
  status: 'needs_response' | 'active' | 'completed'
): Promise<void> {
  const { error } = await supabase
    .from('cases')
    .update({
      metadata: {
        chat_status: status,
        last_chat_update: new Date().toISOString()
      }
    })
    .eq('id', caseId)

  if (error) throw error
}