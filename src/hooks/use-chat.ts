'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { MEDICAL_INTAKE_PROMPT } from '@/lib/ai/prompts'
import {
  type MedicalMessage,
  type UIMessage,
  type TypingStatus,
  type MessageStatus,
  type PresenceState,
  type MedicalConversation,
  type MedicalConversationWithMessages,
  type ChatAccess,
  type MessageInsert,
  type TriageDecision,
  ConversationId,
  UserId
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
import { useAuth } from '@/providers/auth-provider'
import { LLMController } from '@/lib/ai/llm-controller'
import { createClient } from '@/utils/supabase/client'
import { processAIMessage, makeTriageDecision } from '@/lib/actions/ai'

interface UseChatOptions {
  conversationId?: string
  patientId?: string
  onError?: (error: Error) => void
}

function logError(context: string, error: unknown, data?: any) {
  console.error(`[Chat Hook] ${context}:`, {
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    data: JSON.stringify(data, null, 2)
  })
}

function logDebug(context: string, data?: any) {
  console.debug(`[Chat Hook] ${context}:`, 
    typeof data === 'object' ? JSON.stringify(data, null, 2) : data
  )
}

function logWarning(context: string, data?: any) {
  console.warn(`[Chat Hook] ${context}:`, 
    typeof data === 'object' ? JSON.stringify(data, null, 2) : data
  )
}

export function useChat({ 
  conversationId, 
  patientId,
  onError 
}: UseChatOptions = {}) {
  const { user, userRole } = useAuth()
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [conversations, setConversations] = useState<MedicalConversationWithMessages[]>([])
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingStatus>>(new Map())
  const [presenceState, setPresenceState] = useState<PresenceState>({})
  const [chatAccess, setChatAccess] = useState<ChatAccess>({
    canAccess: 'ai',
  })
  const channelRef = useRef<RealtimeChannel | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const llmController = useRef<LLMController | null>(null)
  const supabase = createClient()

  // Initialize LLM controller if needed
  useEffect(() => {
    if (!llmController.current) {
      llmController.current = new LLMController()
    }
  }, [])

  // Log initial state
  useEffect(() => {
    logDebug('Initial chat hook state', {
      conversationId,
      patientId,
      userRole,
      userId: user?.id,
      isOwnData: user?.id === patientId
    })
  }, [conversationId, patientId, user?.id, userRole])

  // Handle chat access based on role and case assignment
  useEffect(() => {
    let mounted = true

    async function checkAccess() {
      try {
        logDebug('Checking chat access', { conversationId, userRole })

        // If no conversationId, handle initial access state
        if (!conversationId) {
          let access: ChatAccess
          if (userRole === 'admin') {
            access = { canAccess: 'both' }
          } else if (userRole === 'staff') {
            access = { 
              canAccess: 'provider',
              providerId: user?.id as UserId
            }
          } else if (userRole === 'patient') {
            access = { canAccess: 'both' }
          } else {
            access = { canAccess: 'ai' }
          }
          logDebug('Setting initial access', { access, userRole })
          setChatAccess(access)
          return
        }

        // For existing conversations, check specific access
        const { data: conversation, error: dbError } = await supabase
          .from('medical_conversations')
          .select('case_id, can_create_case, assigned_staff_id, patient_id')
          .eq('id', conversationId)
          .single()

        if (dbError) {
          logError('Database error checking access', dbError, { conversationId })
          // Don't default to AI access on error for patients
          if (userRole === 'patient') {
            setChatAccess({ canAccess: 'both' })
          } else {
            setChatAccess({ canAccess: 'ai' })
          }
          return
        }

        if (!mounted || !conversation) {
          logWarning('No conversation found or component unmounted', { 
            conversationId,
            mounted,
            conversation 
          })
          // Don't default to AI access for patients
          if (userRole === 'patient') {
            setChatAccess({ canAccess: 'both' })
          } else {
            setChatAccess({ canAccess: 'ai' })
          }
          return
        }

        logDebug('Found conversation for access check', conversation)

        // Check if staff has access through case assignment
        let hasStaffAccess = false
        if (conversation.case_id && userRole === 'staff') {
          const { data: case_, error: caseError } = await supabase
            .from('cases')
            .select('assigned_to')
            .eq('id', conversation.case_id)
            .single()
          
          if (caseError) {
            logError('Error checking case assignment', caseError, { 
              caseId: conversation.case_id 
            })
          } else {
            hasStaffAccess = case_?.assigned_to === user?.id
            logDebug('Checked staff case access', { 
              hasAccess: hasStaffAccess,
              caseId: conversation.case_id,
              assignedTo: case_?.assigned_to
            })
          }
        }

        // Determine access level based on role and ownership
        let access: ChatAccess
        if (userRole === 'patient' && conversation.patient_id === user?.id) {
          // Patients always have access to their own conversations
          access = { canAccess: 'both' }
        } else if (userRole === 'admin') {
          access = { canAccess: 'both' }
        } else if (userRole === 'staff' && (conversation.assigned_staff_id === user?.id || hasStaffAccess)) {
          access = { 
            canAccess: 'provider',
            providerId: user?.id as UserId
          }
        } else if (conversation.can_create_case) {
          // If no specific access and case can be created, default to AI
          access = { canAccess: 'ai' }
        } else {
          // Default to AI access for non-owners
          access = { canAccess: 'ai' }
        }

        logDebug('Setting conversation access', { 
          access,
          userRole,
          isPatientOwner: conversation.patient_id === user?.id,
          isStaffAssigned: conversation.assigned_staff_id === user?.id,
          hasStaffAccess,
          canCreateCase: conversation.can_create_case
        })

        if (mounted) {
          setChatAccess(access)
        }
      } catch (err) {
        logError('Error checking chat access', err)
        // Don't default to AI access on error for patients
        if (mounted) {
          if (userRole === 'patient') {
            setChatAccess({ canAccess: 'both' })
          } else {
            setChatAccess({ canAccess: 'ai' })
          }
        }
      }
    }

    checkAccess()
    return () => { mounted = false }
  }, [conversationId, user?.id, userRole, supabase])

  // Load conversations (metadata only)
  useEffect(() => {
    let mounted = true
    setLoadingConversations(true)

    async function loadConversations() {
      try {
        logDebug('Loading conversations', { userRole, patientId: user?.id })

        // For patients, use their own ID, for staff/admin use provided patientId
        const targetPatientId = userRole === 'patient' ? user?.id : patientId
        
        // Early return with empty conversations if no valid ID
        if (!targetPatientId) {
          logWarning('No valid patient ID for loading conversations', {
            userRole,
            userId: user?.id,
            providedPatientId: patientId
          })
          setConversations([])
          return
        }

        const data = await getConversations(targetPatientId as UserId, 1, 20, 'active')
        if (mounted && Array.isArray(data)) {
          logDebug('Loaded conversations', { 
            count: data.length,
            conversations: data.map(c => ({
              id: c.id,
              messageCount: c.messages.length,
              access: c.access
            }))
          })
          setConversations(data)
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load conversations')
        logError('Failed to load conversations', error)
        if (mounted) {
          setError(error)
          onError?.(error)
          setConversations([])
        }
      } finally {
        if (mounted) {
          setLoadingConversations(false)
        }
      }
    }

    if (user?.id || patientId) {
      loadConversations()
    } else {
      logWarning('No user ID or patient ID available', { userId: user?.id, patientId })
      setLoadingConversations(false)
      setConversations([])
    }

    return () => { mounted = false }
  }, [user?.id, userRole, patientId, onError])

  // Load messages for current conversation
  useEffect(() => {
    let mounted = true
    let unsubscribe: (() => void) | undefined

    async function loadMessages() {
      if (!conversationId) {
        logWarning('No conversation ID provided for loading messages')
        return
      }

      setIsLoading(true)
      try {
        logDebug('Loading messages for conversation', { conversationId })
        const { data: messages, unsubscribe: unsub } = await subscribeToMessages(conversationId)
        unsubscribe = unsub

        if (mounted && Array.isArray(messages)) {
          logDebug('Loaded messages', { 
            count: messages.length,
            firstMessage: messages[0]?.id,
            lastMessage: messages[messages.length - 1]?.id
          })
          setMessages(messages)
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load messages')
        logError('Failed to load messages', error, { conversationId })
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

    if (conversationId) {
      loadMessages()
    } else {
      setMessages([])
      setIsLoading(false)
    }

    return () => {
      mounted = false
      unsubscribe?.()
    }
  }, [conversationId, onError])

  // Handle typing indicators
  useEffect(() => {
    let mounted = true
    let unsubscribe: (() => void) | undefined

    async function subscribeToTyping() {
      if (!conversationId) {
        logWarning('No conversation ID provided for typing subscription')
        return
      }

      try {
        logDebug('Subscribing to typing indicators', { conversationId })
        const { unsubscribe: unsub } = await subscribeToTypingIndicators(
          conversationId,
          (typingStatus: TypingStatus) => {
            if (mounted) {
              logDebug('Received typing update', typingStatus)
              setTypingUsers(new Map(Object.entries(typingStatus)))
            }
          }
        )
        unsubscribe = unsub
      } catch (err) {
        logError('Failed to subscribe to typing indicators', err, { conversationId })
      }
    }

    if (conversationId) {
      subscribeToTyping()
    }

    return () => {
      mounted = false
      unsubscribe?.()
    }
  }, [conversationId])

  // Handle presence
  useEffect(() => {
    let mounted = true
    let unsubscribe: (() => void) | undefined

    async function subscribeToPresenceUpdates() {
      if (!conversationId) {
        logWarning('No conversation ID provided for presence subscription')
        return
      }

      try {
        logDebug('Subscribing to presence updates', { conversationId })
        const { unsubscribe: unsub } = await subscribeToPresence(
          conversationId,
          (presence: PresenceState) => {
            if (mounted) {
              logDebug('Received presence update', presence)
              setPresenceState(presence)
            }
          }
        )
        unsubscribe = unsub
      } catch (err) {
        logError('Failed to subscribe to presence updates', err, { conversationId })
      }
    }

    if (conversationId) {
      subscribeToPresenceUpdates()
    }

    return () => {
      mounted = false
      unsubscribe?.()
    }
  }, [conversationId])

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
      conversationId as ConversationId,
      // New message handler
      (message) => {
        setMessages(prev => [...prev, {
          ...message,
          state: { status: 'sent', id: message.id },
          metadata: { status: 'delivered', type: 'standard' }
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
      (status: { messageId: string; status: MessageStatus }) => {
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

  // Handle message sending with access control and notifications
  const handleSendMessage = async (content: string) => {
    if (!conversationId || !user?.id) {
      logWarning('Cannot send message - missing conversation ID or user ID', {
        conversationId,
        userId: user?.id
      })
      return
    }

    try {
      logDebug('Sending message', { 
        conversationId,
        userId: user.id,
        contentLength: content.length 
      })

      // Always send as user for AI responses unless explicitly in provider mode
      const role = chatAccess.canAccess === 'provider' ? 'assistant' : 'user'
      const requireAI = chatAccess.canAccess !== 'provider'

      const message = await sendMessage(
        content,
        conversationId as ConversationId,
        role,
        requireAI ? {
          type: 'ai_processing',
          status: 'sending',
          confidenceScore: 0,
          collectedInfo: {
            urgencyIndicators: []
          }
        } : {
          type: 'standard',
          status: 'sending'
        }
      )

      logDebug('Message sent successfully', { 
        messageId: message.id,
        role: message.role,
        requiresAI: requireAI
      })

      return message
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send message')
      logError('Failed to send message', error)
      throw error
    }
  }

  // Handle AI-to-staff handoff with notifications
  const handleHandoff = async (triageDecision: TriageDecision) => {
    if (!conversationId) return

    try {
      // Update conversation to disable AI
      const { error: updateError } = await supabase
        .from('medical_conversations')
        .update({ can_create_case: false })
        .eq('id', conversationId)

      if (updateError) throw updateError

      // Send handoff message
      const handoffMessage: MessageInsert = {
        conversation_id: conversationId,
        content: `Based on our conversation, I recommend speaking with a medical provider. ${
          triageDecision === 'EMERGENCY' ? 'This appears to be urgent.' : 
          'They will review your information and assist you further.'
        }`,
        role: 'assistant',
        metadata: {
          handoffStatus: 'initiated',
          triageDecision
        }
      }

      const { error: messageError } = await supabase
        .from('medical_messages')
        .insert(handoffMessage)

      if (messageError) throw messageError

      // Get available staff in the appropriate department
      const { data: staffMembers } = await supabase
        .from('users')
        .select('id, department')
        .eq('role', 'staff')
        .eq('department', triageDecision === 'EMERGENCY' ? 'emergency' : 'triage')

      // Send notifications to available staff
      if (staffMembers?.length) {
        for (const staff of staffMembers) {
          await supabase.rpc('send_notification', {
            p_user_id: staff.id,
            p_type: 'handoff_request',
            p_title: triageDecision === 'EMERGENCY' ? 'Urgent: New patient requires immediate attention' : 'New patient requires review',
            p_content: 'AI has completed initial assessment and recommends provider review.',
            p_metadata: {
              handoff: {
                from_ai: true,
                reason: triageDecision,
                urgency: triageDecision === 'EMERGENCY' ? 'high' : 'medium'
              },
              conversation: {
                id: conversationId
              }
            },
            p_priority: triageDecision === 'EMERGENCY' ? 'urgent' : 'high'
          })
        }
      }

      // Update access state
      setChatAccess(prev => ({
        ...prev,
        canAccess: 'both'
      }))
    } catch (err) {
      console.error('Error handling handoff:', err)
    }
  }

  // Send typing indicator
  const handleTyping = useCallback((isTyping: boolean) => {
    if (!conversationId) return

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    sendTypingIndicator(conversationId as ConversationId, isTyping)

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        if (conversationId) {
          sendTypingIndicator(conversationId as ConversationId, false)
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
      const conversation = await createConversation(patientId as UserId)
      if (conversation) {
        setConversations(prev => [...prev, { ...conversation, messages: [], status: 'active' } as MedicalConversationWithMessages])
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
      await updateConversationStatus(id as ConversationId, status)
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
      await deleteConversation(id as ConversationId)
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
    chatAccess,
    
    // Actions
    sendMessage: handleSendMessage,
    sendTyping: handleTyping,
    markAsRead: handleMarkAsRead,
    createConversation: handleCreateConversation,
    updateStatus: handleUpdateStatus,
    deleteConversation: handleDeleteConversation,
    handleHandoff
  }
} 