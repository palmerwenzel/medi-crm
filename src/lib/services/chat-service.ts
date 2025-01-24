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
  type PresenceState
} from '@/types/chat'

const supabase = createClient()

/**
 * Subscribes to real-time updates for a conversation
 */
export function subscribeToConversation(
  conversationId: string,
  onMessage: (message: MedicalMessage) => void,
  onTyping: (status: TypingStatus) => void,
  onMessageStatus: (status: MessageStatus) => void,
  onPresence: (state: PresenceState) => void
) {
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
        onMessage(payload.new as MedicalMessage)
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
        onMessageStatus({
          messageId: payload.new.id,
          status: payload.new.metadata?.status || 'delivered'
        })
      }
    )
    // Typing indicators
    .on('broadcast', { event: 'typing' }, (payload) => {
      onTyping(payload.payload as TypingStatus)
    })
    // Track presence
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      onPresence(state as unknown as PresenceState)
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      const state = channel.presenceState()
      onPresence(state as unknown as PresenceState)
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      const state = channel.presenceState()
      onPresence(state as unknown as PresenceState)
    })

  return channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await channel.track({
          user_id: user.id,
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
  conversationId: string,
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
        userId: user.id,
        timestamp: new Date().toISOString()
      }
    })
}

/**
 * Updates message status (delivered/read)
 */
export async function updateMessageStatus(
  messageId: string,
  status: 'delivered' | 'read'
): Promise<void> {
  const { error } = await supabase
    .from('medical_messages')
    .update({
      metadata: {
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
  conversationId: string,
  role: 'system' | 'user' | 'assistant' = 'user',
  metadata: Record<string, any> = {}
): Promise<UIMessage> {
  // Create temporary message for optimistic update
  const tempMessage: UIMessage = {
    id: crypto.randomUUID(),
    conversation_id: conversationId,
    content,
    role,
    created_at: new Date().toISOString(),
    metadata: { status: 'sending', ...metadata },
    state: { status: 'sending', tempId: crypto.randomUUID() }
  }

  try {
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

    const data = await response.json()
    
    // Return the user message with updated state
    return {
      ...tempMessage,
      id: data.userMessage.id,
      metadata: { status: 'delivered', ...metadata },
      state: { status: 'sent', id: data.userMessage.id }
    }
  } catch (error) {
    console.error('Failed to send message:', error)
    return {
      ...tempMessage,
      metadata: { status: 'error', ...metadata },
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
export async function createConversation(patientId: string): Promise<MedicalConversation> {
  const response = await fetch('/api/chat/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientId })
  })

  if (!response.ok) {
    throw new Error('Failed to create conversation')
  }

  return response.json()
}

/**
 * Fetches messages for a conversation with pagination
 */
export async function getMessages(
  conversationId: string,
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

  return response.json()
}

/**
 * Updates a conversation's status
 */
export async function updateConversationStatus(
  conversationId: string,
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
 * Fetches conversations for a patient with pagination
 */
export async function getConversations(
  patientId: string,
  page = 1,
  limit = 20,
  status?: 'active' | 'archived'
): Promise<MedicalConversationWithMessages[]> {
  const params = new URLSearchParams({
    patientId,
    page: page.toString(),
    limit: limit.toString()
  })

  if (status) {
    params.append('status', status)
  }

  const response = await fetch(`/api/chat/conversations?${params}`, {
    method: 'GET'
  })

  if (!response.ok) {
    // If it's a 404 (no conversations), return empty array
    if (response.status === 404) {
      return []
    }
    throw new Error('Failed to fetch conversations')
  }

  const { success, data } = await response.json()
  
  // If the request was successful but no data, return empty array
  if (success && !data) {
    return []
  }
  
  // If we have data, ensure it's an array
  if (success && Array.isArray(data)) {
    return data.map(conv => ({
      ...conv,
      messages: [] // Initialize empty messages array
    }))
  }

  // Fallback to empty array if something went wrong
  return []
}

/**
 * Deletes a conversation
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  const response = await fetch(`/api/chat/${conversationId}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw new Error('Failed to delete conversation')
  }
}