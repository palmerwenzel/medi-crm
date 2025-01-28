'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import type {
  ChatAccess,
  MessageInsert,
  TriageDecision
} from '@/types/domain/chat'
import type { UserId } from '@/types/domain/users'
import type {
  UIMessage,
  MessageStatus,
  TypingStatus,
  PresenceState,
  UIMedicalConversation,
  LogData
} from '@/types/domain/ui'
import {
  subscribeToConversation,
  sendMessage,
  sendTypingIndicator,
  updateMessageStatus,
  getConversations,
  createConversation,
  updateConversationStatus,
  deleteConversation,
  subscribeToMessages,
  subscribeToTypingIndicators,
  subscribeToPresence
} from '@/lib/services/chat-service'
import { useAuth } from '@/providers/auth-provider'
import { createClient } from '@/utils/supabase/client'
import type { DbDepartment } from '@/types/domain/db'
import { medicalConversationsRowSchema } from '@/lib/validations/medical-conversations'
import { rawToConversationIdSchema, rawToUserIdSchema } from '@/lib/validations/shared-schemas'

interface UseChatOptions {
  conversationId?: string
  patientId?: string
  onError?: (error: Error) => void
}

function logError(context: string, error: unknown, data?: LogData) {
  console.error(`[Chat Hook] ${context}:`, {
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    data: JSON.stringify(data, null, 2)
  })
}

function logDebug(context: string, data?: LogData) {
  console.debug(`[Chat Hook] ${context}:`, 
    typeof data === 'object' ? JSON.stringify(data, null, 2) : data
  )
}

function logWarning(context: string, data?: LogData) {
  console.warn(`[Chat Hook] ${context}:`, 
    typeof data === 'object' ? JSON.stringify(data, null, 2) : data
  )
}

// Update the handoff message content based on triage decision
function getHandoffMessage(triage_decision: TriageDecision): string {
  switch (triage_decision) {
    case 'EMERGENCY':
      return 'Based on our conversation, this appears to be an emergency situation. I recommend seeking immediate medical attention.';
    case 'URGENT':
      return 'Based on our conversation, this requires urgent medical attention. While not an immediate emergency, you should be seen by a healthcare provider soon.';
    case 'NON_URGENT':
      return 'Based on our conversation, I recommend speaking with a medical provider. They will review your information and assist you further.';
    case 'SELF_CARE':
      return 'Based on our conversation, this can likely be managed with self-care measures. However, I will connect you with a provider for guidance.';
    default:
      return 'Based on our conversation, I recommend speaking with a medical provider. They will review your information and assist you further.';
  }
}

// Update the department mapping based on triage decision
function getDepartment(triage_decision: TriageDecision): DbDepartment {
  switch (triage_decision) {
    case 'EMERGENCY':
      return 'emergency';
    case 'URGENT':
      return 'primary_care';
    case 'NON_URGENT':
      return 'primary_care';
    case 'SELF_CARE':
      return 'primary_care';
    default:
      return 'primary_care';
  }
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
  const [conversations, setConversations] = useState<UIMedicalConversation[]>([])
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingStatus>>(new Map())
  const [presenceState, setPresenceState] = useState<PresenceState>({})
  const [chatAccess, setChatAccess] = useState<ChatAccess>({
    can_access: 'ai',
  })
  const channelRef = useRef<RealtimeChannel | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

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
            access = { can_access: 'both' }
          } else if (userRole === 'staff' && user?.id) {
            access = { 
              can_access: 'provider',
              provider_id: user.id as UserId
            }
          } else if (userRole === 'patient') {
            access = { can_access: 'both' }
          } else {
            access = { can_access: 'ai' }
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
            setChatAccess({ can_access: 'both' })
          } else {
            setChatAccess({ can_access: 'ai' })
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
            setChatAccess({ can_access: 'both' })
          } else {
            setChatAccess({ can_access: 'ai' })
          }
          return
        }

        logDebug('Found conversation for access check', conversation)

        // Check if staff has access through case assignment
        let hasStaffAccess = false
        if (conversation.case_id && userRole === 'staff' && user?.id) {
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
            hasStaffAccess = case_?.assigned_to === user.id
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
          access = { can_access: 'both' }
        } else if (userRole === 'admin') {
          access = { can_access: 'both' }
        } else if (userRole === 'staff' && user?.id && (conversation.assigned_staff_id === user.id || hasStaffAccess)) {
          access = { 
            can_access: 'provider',
            provider_id: user.id as UserId
          }
        } else if (conversation.can_create_case) {
          // If no specific access and case can be created, default to AI
          access = { can_access: 'ai' }
        } else {
          // Default to AI access for non-owners
          access = { can_access: 'ai' }
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
            setChatAccess({ can_access: 'both' })
          } else {
            setChatAccess({ can_access: 'ai' })
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

        const data = await getConversations(rawToUserIdSchema.parse(targetPatientId), 1, 20, 'active')
        if (mounted && Array.isArray(data)) {
          logDebug('Loaded conversations', { 
            count: data.length,
            conversations: data.map(c => ({
              id: c.id,
              messageCount: c.messages.length,
              access: c.access
            }))
          })
          const validatedConversations = data.map(conv => medicalConversationsRowSchema.parse(conv))
          setConversations(validatedConversations)
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
        const { data: messages, unsubscribe: unsub } = await subscribeToMessages(rawToConversationIdSchema.parse(conversationId))
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
          rawToConversationIdSchema.parse(conversationId),
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
          rawToConversationIdSchema.parse(conversationId),
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
      rawToConversationIdSchema.parse(conversationId),
      // New message handler
      (message) => {
        setMessages(prev => [...prev, message])
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
      const role = chatAccess.can_access === 'provider' ? 'assistant' : 'user'
      const requireAI = chatAccess.can_access !== 'provider'

      const message = await sendMessage(
        content,
        rawToConversationIdSchema.parse(conversationId),
        role,
        requireAI ? {
          type: 'ai_processing' as const,
          status: 'pending',
          confidence_score: 0,
          collected_info: {
            urgency_indicators: []
          }
        } : {
          type: 'standard' as const,
          status: 'pending'
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
  const handleHandoff = async (triage_decision: TriageDecision) => {
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
        content: getHandoffMessage(triage_decision),
        role: 'assistant',
        metadata: {
          type: 'handoff',
          handoff_status: 'pending',
          triage_decision
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
        .eq('department', getDepartment(triage_decision))

      // Send notifications to available staff
      if (staffMembers?.length) {
        for (const staff of staffMembers) {
          await supabase.rpc('send_notification', {
            p_user_id: staff.id,
            p_type: 'handoff_request',
            p_title: 'New patient requires provider review',
            p_content: 'AI has completed initial assessment and recommends provider review.',
            p_metadata: {
              handoff: {
                from_ai: true,
                reason: triage_decision,
                urgency: 'medium'
              },
              conversation: {
                id: conversationId
              }
            },
            p_priority: 'high'
          })
        }
      }

      // Update access state
      setChatAccess(prev => ({
        ...prev,
        can_access: 'both'
      } as ChatAccess))
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

    sendTypingIndicator(rawToConversationIdSchema.parse(conversationId), isTyping)

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        if (conversationId) {
          sendTypingIndicator(rawToConversationIdSchema.parse(conversationId), false)
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
      const conversation = await createConversation(rawToUserIdSchema.parse(patientId))
      if (conversation) {
        const validatedConversation = medicalConversationsRowSchema.parse(conversation)
        setConversations(prev => [...prev, validatedConversation])
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
      await updateConversationStatus(rawToConversationIdSchema.parse(id), status)
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
      await deleteConversation(rawToConversationIdSchema.parse(id))
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
    isLoading,
    loadingConversations,
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