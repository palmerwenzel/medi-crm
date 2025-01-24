'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import {
  type MedicalMessage,
  type UIMessage,
  type TypingStatus,
  type MessageStatus,
  type PresenceState,
  type MedicalConversation,
  type MedicalConversationWithMessages
} from '@/types/chat'
import {
  subscribeToConversation,
  sendMessage,
  sendTypingIndicator,
  updateMessageStatus,
  getMessages,
  getConversations,
  createConversation,
  updateConversationStatus,
  deleteConversation
} from '@/lib/services/chat-service'

interface UseChatOptions {
  conversationId?: string
  patientId?: string
  onError?: (error: Error) => void
}

export function useChat({ 
  conversationId, 
  patientId,
  onError 
}: UseChatOptions = {}) {
  // Messages state
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Conversations state
  const [conversations, setConversations] = useState<MedicalConversationWithMessages[]>([])
  const [loadingConversations, setLoadingConversations] = useState(false)

  // Real-time states
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingStatus>>(new Map())
  const [presenceState, setPresenceState] = useState<PresenceState>({})
  const channelRef = useRef<RealtimeChannel | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load conversations (metadata only)
  useEffect(() => {
    if (!patientId || typeof patientId !== 'string') return

    let mounted = true

    async function loadConversations() {
      try {
        setLoadingConversations(true)
        const data = await getConversations(patientId!, 1, 20, 'active')
        if (mounted && Array.isArray(data)) {
          setConversations(data.map(conv => ({
            ...conv,
            messages: [], // Initialize empty messages array
            status: conv.status || 'active' // Ensure status is set
          })))
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load conversations')
        if (mounted) {
          setError(error)
          onError?.(error)
        }
      } finally {
        if (mounted) {
          setLoadingConversations(false)
        }
      }
    }

    loadConversations()
    return () => { mounted = false }
  }, [patientId, onError])

  // Load messages only when a conversation is selected
  useEffect(() => {
    if (!conversationId || typeof conversationId !== 'string') {
      setMessages([])
      return
    }

    let mounted = true

    async function loadMessages(id: string) {
      try {
        setIsLoading(true)
        const data = await getMessages(id)
        if (mounted) {
          // Handle empty messages gracefully
          const messages = data || []
          setMessages(messages.map(msg => ({
            ...msg,
            state: { status: 'sent', id: msg.id },
            metadata: { status: 'delivered' }
          })))

          // Update the messages in the conversations list too
          setConversations(prev => prev.map(conv => 
            conv.id === id 
              ? { ...conv, messages } 
              : conv
          ))
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load messages')
        if (mounted) {
          setError(error)
          onError?.(error)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    // Type assertion is safe here because we've checked the type above
    loadMessages(conversationId as string)
    return () => { mounted = false }
  }, [conversationId, onError])

  // Set up real-time subscription
  useEffect(() => {
    if (!conversationId || typeof conversationId !== 'string') {
      // Clean up any existing subscription
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
      return
    }

    const channel = subscribeToConversation(
      conversationId,
      // New message handler
      (message) => {
        setMessages(prev => [...prev, {
          ...message,
          state: { status: 'sent', id: message.id },
          metadata: { status: 'delivered' }
        }])
      },
      // Typing indicator handler
      (status) => {
        setTypingUsers(prev => {
          const next = new Map(prev)
          if (status.isTyping) {
            next.set(status.userId, status)
          } else {
            next.delete(status.userId)
          }
          return next
        })
      },
      // Message status handler
      (status) => {
        setMessages(prev => prev.map(msg => 
          msg.id === status.messageId
            ? { ...msg, metadata: { ...msg.metadata, status: status.status } }
            : msg
        ))
      },
      // Presence handler
      (state) => {
        setPresenceState(state)
      }
    )

    channelRef.current = channel
    return () => {
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [conversationId])

  // Send message handler
  const handleSendMessage = useCallback(async (content: string) => {
    try {
      if (!patientId) throw new Error('Patient ID is required')

      // Create conversation if none exists
      let id = conversationId
      if (!id) {
        const conversation = await createConversation(patientId)
        id = conversation.id
      }

      if (!id) throw new Error('Failed to get conversation ID')

      // Send message with system prompt in metadata
      const message = await sendMessage(content, id, 'user', {
        systemPrompt: `You are a compassionate medical intake assistant designed to help patients provide preliminary medical information. Your role is to:
1. Gather relevant medical history, symptoms, and concerns from patients
2. Ask follow-up questions to clarify medical information when needed
3. Provide empathetic responses while maintaining professional medical communication
4. Guide patients through the intake process step by step
5. Escalate to human medical staff when necessary
6. Respect patient privacy and maintain medical confidentiality

Remember to:
- Use clear, patient-friendly medical terminology
- Show empathy while maintaining professional boundaries
- Ask one question at a time to avoid overwhelming patients
- Acknowledge patient concerns and validate their experiences
- Flag any urgent medical concerns for immediate staff attention
- Maintain HIPAA-compliant communication standards`
      })

      return message
    } catch (error) {
      console.error('Failed to send message:', error)
      onError?.(error instanceof Error ? error : new Error('Failed to send message'))
      return null
    }
  }, [patientId, conversationId, sendMessage, createConversation, onError])

  // Send typing indicator
  const handleTyping = useCallback((isTyping: boolean) => {
    if (!conversationId) return

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    sendTypingIndicator(conversationId, isTyping)

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        if (conversationId) {
          sendTypingIndicator(conversationId, false)
        }
      }, 3000)
    }
  }, [conversationId])

  // Mark message as read
  const handleMarkAsRead = useCallback(async (messageId: string) => {
    try {
      await updateMessageStatus(messageId, 'read')
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update message status')
      setError(error)
      onError?.(error)
    }
  }, [onError])

  // Create new conversation
  const handleCreateConversation = useCallback(async () => {
    if (!patientId || typeof patientId !== 'string') throw new Error('No patient ID provided')

    try {
      const conversation = await createConversation(patientId)
      if (conversation) {
        setConversations(prev => [...prev, { ...conversation, messages: [], status: 'active' }])
      }
      return conversation
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create conversation')
      setError(error)
      onError?.(error)
      throw error
    }
  }, [patientId, onError])

  // Update conversation status
  const handleUpdateStatus = useCallback(async (id: string, status: 'active' | 'archived') => {
    try {
      await updateConversationStatus(id, status)
      setConversations(prev => prev.map(conv => 
        conv.id === id ? { ...conv, status } : conv
      ))
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update conversation status')
      setError(error)
      onError?.(error)
      throw error
    }
  }, [onError])

  // Delete conversation
  const handleDeleteConversation = useCallback(async (id: string) => {
    try {
      await deleteConversation(id)
      setConversations(prev => prev.filter(conv => conv.id !== id))
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete conversation')
      setError(error)
      onError?.(error)
      throw error
    }
  }, [onError])

  return {
    // State
    messages,
    conversations,
    isLoading: isLoading || loadingConversations,
    error,
    typingUsers,
    presenceState,
    
    // Actions
    sendMessage: handleSendMessage,
    sendTyping: handleTyping,
    markAsRead: handleMarkAsRead,
    createConversation: handleCreateConversation,
    updateStatus: handleUpdateStatus,
    deleteConversation: handleDeleteConversation
  }
} 