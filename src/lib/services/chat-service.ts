/**
 * Handles chat operations and real-time updates for the medical intake chatbot.
 */
'use client'

import { createClient } from '@/utils/supabase/client'
import type { 
  MessageRole, 
  MessageMetadata,
  MedicalConversation,
  ConversationId
} from '@/types/domain/chat'
import type { UserId } from '@/types/domain/users'
import type { 
  UIMessage, 
  MessageStatus,
  TypingStatus,
  PresenceState,
  LogData
} from '@/types/domain/ui'
import { 
  medicalMessagesRowSchema,
  type MedicalMessagesRow
} from '@/lib/validations/medical-messages'
import { 
  medicalConversationsRowSchema,
  type MedicalConversationsRow
} from '@/lib/validations/medical-conversations'
import { 
  uiMessageSchema,
  uiMessageMetadataSchema
} from '@/lib/validations/ui'
import { messageMetadataSchema } from '@/lib/validations/message-metadata'
import { rawToUserIdSchema } from '@/lib/validations/shared-schemas'

const supabase = createClient()

function logError(context: string, error: unknown, data?: LogData) {
  console.error(`[Chat Service] ${context}:`, {
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    data: JSON.stringify(data, null, 2)
  })
}

function logDebug(context: string, data?: LogData) {
  console.debug(`[Chat Service] ${context}:`, 
    typeof data === 'object' ? JSON.stringify(data, null, 2) : data
  )
}

function logWarning(context: string, data?: LogData) {
  console.warn(`[Chat Service] ${context}:`, 
    typeof data === 'object' ? JSON.stringify(data, null, 2) : data
  )
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
          const dbMessage = medicalMessagesRowSchema.parse(payload.new)
          // Then transform to UI message
          const message = uiMessageSchema.parse({
            ...dbMessage,
            state: { status: 'sent', id: dbMessage.id },
            metadata: {
              ...dbMessage.metadata,
              status: 'delivered'
            }
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
          const dbMessage = medicalMessagesRowSchema.parse(payload.new)
          const metadata = messageMetadataSchema.parse(dbMessage.metadata || {})
          const uiMetadata = uiMessageMetadataSchema.parse({
            ...metadata,
            status: 'delivered'
          })
          onMessageStatus({ 
            messageId: dbMessage.id, 
            status: uiMetadata.status 
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
        if (
          payload?.payload &&
          typeof payload.payload === 'object' &&
          'conversationId' in payload.payload &&
          'userId' in payload.payload &&
          'isTyping' in payload.payload &&
          'timestamp' in payload.payload &&
          typeof payload.payload.conversationId === 'string' &&
          typeof payload.payload.userId === 'string' &&
          typeof payload.payload.isTyping === 'boolean' &&
          typeof payload.payload.timestamp === 'string'
        ) {
          const typingStatus: TypingStatus = {
            conversationId: payload.payload.conversationId,
            userId: rawToUserIdSchema.parse(payload.payload.userId),
            isTyping: payload.payload.isTyping,
            timestamp: payload.payload.timestamp
          }
          onTyping(typingStatus)
        } else {
          throw new Error('Invalid typing status payload')
        }
      } catch (error) {
        logError('Failed to process typing indicator', error, payload)
      }
    })
    // Track presence
    .on('presence', { event: 'sync' }, () => {
      try {
        const rawState = channel.presenceState()
        const presenceState: PresenceState = {}
        
        for (const [key, presences] of Object.entries(rawState)) {
          const validPresences = (presences as unknown as Array<{ user_id: string; online_at: string }>)
            .filter(presence => 
              presence && 
              typeof presence.user_id === 'string' && 
              typeof presence.online_at === 'string'
            )
            .map(presence => ({
              user_id: rawToUserIdSchema.parse(presence.user_id),
              online_at: presence.online_at
            }))
          if (validPresences.length > 0) {
            presenceState[key] = validPresences
          }
        }
        
        onPresence(presenceState)
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
          user_id: rawToUserIdSchema.parse(user.id),
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
        userId: rawToUserIdSchema.parse(user.id),
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
  role: MessageRole = 'user',
  metadata: MessageMetadata = { 
    type: 'standard',
    is_case_creation: false,
    is_assessment_creation: false,
    is_final: false
  }
): Promise<UIMessage> {
  // Create temporary message for optimistic update
  const tempMessage = uiMessageSchema.parse({
    id: crypto.randomUUID(),
    conversation_id: conversationId,
    content,
    role,
    created_at: new Date().toISOString(),
    metadata: { ...metadata, status: 'pending' },
    state: { status: 'sending', tempId: crypto.randomUUID() }
  })

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
        (conversation.case_id && await supabase
          .from('cases')
          .select('id')
          .eq('id', conversation.case_id)
          .eq('assigned_to', user.id)
          .maybeSingle()
          .then(({ data }) => !!data))
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
      body: JSON.stringify({ 
        content, 
        role, 
        metadata
      })
    })

    if (!response.ok) {
      throw new Error('Failed to send message')
    }

    const { success, data, error } = await response.json()
    
    if (!success || !data) {
      throw new Error(error || 'Failed to send message')
    }

    // Return the user message with updated state
    return uiMessageSchema.parse({
      ...tempMessage,
      id: data.id,
      metadata: { ...metadata, status: 'delivered' },
      state: { status: 'sent', id: data.id }
    })
  } catch (error) {
    console.error('Failed to send message:', error)
    return uiMessageSchema.parse({
      ...tempMessage,
      metadata: { ...metadata, status: 'pending' },
      state: { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to send message'
      }
    })
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
      logError('No authenticated user found', null)
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
        metadata: {},
        access: { can_access: 'ai' }
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
              metadata: {},
              access: { can_access: 'ai' }
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
        metadata,
        access,
        messages:medical_messages(*)
      `)
      .eq('id', newConversation.id)
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

    const parsedConversation = medicalConversationsRowSchema.parse({
      ...fullConversation,
      messages: fullConversation.messages || []
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
): Promise<MedicalMessagesRow[]> {
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

  return data.map((msg: unknown) => medicalMessagesRowSchema.parse(msg))
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
): Promise<MedicalConversationsRow[]> {
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
    if (!user?.id) {
      logWarning('No authenticated user found', null)
      return []
    }

    const { data: userRole } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    logDebug('User context for fetching conversations', { 
      userId: user.id,
      userRole: userRole?.role,
      isRequestingOwnData: user.id === patientId,
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
        metadata,
        access,
        messages:medical_messages(*)
      `)
      .order('updated_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    // Apply filters based on role and ownership
    if (userRole?.role === 'patient') {
      logDebug('Applying patient role filter', {
        userId: user.id,
        timestamp: new Date().toISOString()
      })
      // Patients can only see their own conversations
      query = query.eq('patient_id', user.id)
    } else if (userRole?.role === 'staff' || userRole?.role === 'admin') {
      logDebug('Applying staff/admin role filter', {
        userId: user.id,
        patientId,
        timestamp: new Date().toISOString()
      })
      // Staff/admin can see conversations for the specified patient
      query = query.eq('patient_id', patientId)
    } else {
      logWarning('Unknown user role - no access granted', {
        userId: user.id,
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

    // Parse and validate conversations
    const validConversations = conversations
      .map(conv => {
        try {
          return medicalConversationsRowSchema.parse({
            ...conv,
            messages: conv.messages || []
          })
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
        messageCount: c.messages.length
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

/**
 * Subscribes to presence updates for a conversation
 */
export async function subscribeToPresence(
  conversationId: ConversationId,
  onPresence: (state: PresenceState) => void
) {
  const channel = supabase
    .channel(`presence:${conversationId}`)
    .on('presence', { event: 'sync' }, () => {
      try {
        const rawState = channel.presenceState()
        const presenceState: PresenceState = {}
        
        for (const [key, presences] of Object.entries(rawState)) {
          const validPresences = (presences as unknown as Array<{ user_id: string; online_at: string }>)
            .filter(presence => 
              presence && 
              typeof presence.user_id === 'string' && 
              typeof presence.online_at === 'string'
            )
            .map(presence => ({
              user_id: rawToUserIdSchema.parse(presence.user_id),
              online_at: presence.online_at
            }))
          if (validPresences.length > 0) {
            presenceState[key] = validPresences
          }
        }
        
        onPresence(presenceState)
      } catch (error) {
        logError('Failed to process presence sync', error)
      }
    })

  await channel.subscribe(async (status) => {
    logDebug('Presence channel status changed', { status })
    if (status === 'SUBSCRIBED') {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await channel.track({
          user_id: rawToUserIdSchema.parse(user.id),
          online_at: new Date().toISOString()
        })
      }
    }
  })

  return {
    unsubscribe: () => {
      channel.unsubscribe()
    }
  }
}

/**
 * Subscribes to typing indicators for a conversation
 */
export async function subscribeToTypingIndicators(
  conversationId: ConversationId,
  onTyping: (status: TypingStatus) => void
) {
  const channel = supabase
    .channel(`typing:${conversationId}`)
    .on('broadcast', { event: 'typing' }, (payload) => {
      try {
        logDebug('Typing indicator', payload)
        if (
          payload?.payload &&
          typeof payload.payload === 'object' &&
          'conversationId' in payload.payload &&
          'userId' in payload.payload &&
          'isTyping' in payload.payload &&
          'timestamp' in payload.payload &&
          typeof payload.payload.conversationId === 'string' &&
          typeof payload.payload.userId === 'string' &&
          typeof payload.payload.isTyping === 'boolean' &&
          typeof payload.payload.timestamp === 'string'
        ) {
          const typingStatus: TypingStatus = {
            conversationId: payload.payload.conversationId,
            userId: rawToUserIdSchema.parse(payload.payload.userId),
            isTyping: payload.payload.isTyping,
            timestamp: payload.payload.timestamp
          }
          onTyping(typingStatus)
        } else {
          throw new Error('Invalid typing status payload')
        }
      } catch (error) {
        logError('Failed to process typing indicator', error, payload)
      }
    })

  await channel.subscribe()

  return {
    unsubscribe: () => {
      channel.unsubscribe()
    }
  }
}

/**
 * Subscribes to messages for a conversation
 */
export async function subscribeToMessages(
  conversationId: ConversationId
): Promise<{ data: UIMessage[]; unsubscribe: () => void }> {
  // First fetch existing messages
  const { data: messages, error } = await supabase
    .from('medical_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) throw error

  // Transform messages to UI format with proper type handling
  const uiMessages = messages.map(msg => {
    const dbMessage = medicalMessagesRowSchema.parse(msg)
    const metadata = messageMetadataSchema.parse(dbMessage.metadata || {})
    return uiMessageSchema.parse({
      ...dbMessage,
      state: { status: 'sent', id: dbMessage.id },
      metadata: {
        ...metadata,
        status: 'delivered'
      }
    })
  })

  // Then set up real-time subscription
  const channel = supabase
    .channel(`messages:${conversationId}`)
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
          const dbMessage = medicalMessagesRowSchema.parse(payload.new)
          const message = uiMessageSchema.parse({
            ...dbMessage,
            state: { status: 'sent', id: dbMessage.id },
            metadata: {
              ...dbMessage.metadata,
              status: 'delivered'
            }
          })
          uiMessages.push(message)
        } catch (error) {
          logError('Failed to process new message', error, payload)
        }
      }
    )

  await channel.subscribe()

  return {
    data: uiMessages,
    unsubscribe: () => {
      channel.unsubscribe()
    }
  }
}