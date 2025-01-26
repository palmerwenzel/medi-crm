// src/types/chat.ts
import { Database } from './supabase'

type Tables = Database['public']['Tables']

// Base database types
export type MedicalMessage = Tables['medical_messages']['Row']
export type MessageInsert = Tables['medical_messages']['Insert']
export type MessageUpdate = Tables['medical_messages']['Update']

export type MedicalConversation = Tables['medical_conversations']['Row'] & {
  messages?: MedicalMessage[]
  unread_count?: number
  access?: ChatAccess
}
export type MedicalConversationInsert = Tables['medical_conversations']['Insert']
export type MedicalConversationUpdate = Tables['medical_conversations']['Update']

// Message roles and states as const arrays
export const MessageRoles = ['user', 'assistant', 'provider', 'system'] as const
export type MessageRole = (typeof MessageRoles)[number]

export const MessageStatuses = ['sending', 'delivered', 'read', 'error'] as const
export type MessageStatus = (typeof MessageStatuses)[number]

export const HandoffStatuses = ['pending', 'completed', 'rejected'] as const
export type HandoffStatus = (typeof HandoffStatuses)[number]

export const TriageDecisions = [
  'EXISTING_PROVIDER',
  'NEW_TICKET',
  'CONTINUE_GATHERING',
  'EMERGENCY'
] as const
export type TriageDecision = (typeof TriageDecisions)[number]

// Real-time types with branded IDs
export type ConversationId = string & { readonly __brand: unique symbol }
export type UserId = string & { readonly __brand: unique symbol }

export interface TypingStatus {
  conversationId: ConversationId
  userId: UserId
  isTyping: boolean
  timestamp: string
}

export interface PresenceState {
  [key: string]: {
    user_id: UserId
    online_at: string
  }[]
}

// Discriminated union for message states
export type MessageState = 
  | { status: 'sending'; tempId: string }
  | { status: 'sent'; id: string }
  | { status: 'error'; error: string }

// Message metadata as discriminated union
export type MessageMetadata = 
  | { 
      type: 'ai_processing'
      status: MessageStatus
      confidenceScore?: number
      collectedInfo?: {
        chiefComplaint?: string
        duration?: string
        severity?: string
        existingProvider?: string
        urgencyIndicators: string[]
      }
    }
  | {
      type: 'handoff'
      status: MessageStatus
      handoffStatus: HandoffStatus
      providerId: UserId
      triageDecision: TriageDecision
    }
  | {
      type: 'standard'
      status: MessageStatus
    }

// UI-specific message type
export interface UIMessage {
  id: string
  conversation_id: ConversationId
  content: string
  role: MessageRole
  created_at: string
  state: MessageState
  metadata: MessageMetadata
}

// Chat access as discriminated union
export type ChatAccess = 
  | { canAccess: 'ai' }
  | { 
      canAccess: 'provider'
      providerId: UserId
    }
  | {
      canAccess: 'both'
      providerId?: UserId
      handoffTimestamp?: string
    }

// Database conversation type with messages
export interface MedicalConversationWithMessages extends MedicalConversation {
  messages: MedicalMessage[]
  unread_count: number
  case_id?: string
  can_create_case?: boolean
  assigned_staff_id: string | null
  access: ChatAccess
}

// Chat session with strict typing
export interface ChatSession {
  id: ConversationId
  patientId: UserId
  messages: UIMessage[]
  access: ChatAccess
  status: 'active' | 'waiting_provider' | 'with_provider' | 'completed'
  messageCount: number
  lastMessageAt: Date
}

// OpenAI chat types
export interface ChatRequest {
  messages: {
    role: MessageRole
    content: string
  }[]
}

export interface ChatResponse {
  message: string
  metadata?: MessageMetadata
}

// Type guards
export function isAIProcessingMetadata(
  metadata: MessageMetadata
): metadata is Extract<MessageMetadata, { type: 'ai_processing' }> {
  return metadata.type === 'ai_processing'
}

export function isHandoffMetadata(
  metadata: MessageMetadata
): metadata is Extract<MessageMetadata, { type: 'handoff' }> {
  return metadata.type === 'handoff'
}

export function isProviderAccess(
  access: ChatAccess
): access is Extract<ChatAccess, { canAccess: 'provider' }> {
  return access.canAccess === 'provider'
}

export function isBothAccess(
  access: ChatAccess
): access is Extract<ChatAccess, { canAccess: 'both' }> {
  return access.canAccess === 'both'
}

// Re-export for convenience
export type { Message, MessageInsert } from '@/lib/validations/chat'