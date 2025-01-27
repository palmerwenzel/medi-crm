import type { 
  MedicalMessagesRow,
  MedicalMessagesInsert,
  MedicalMessagesUpdate 
} from '@/lib/validations/medical-messages'
import type {
  MedicalConversationsRow,
  MedicalConversationsInsert,
  MedicalConversationsUpdate
} from '@/lib/validations/medical-conversations'
import type { UserId } from './users'
import type { DbMessageRole } from './db'

// Branded types for type safety
export type ConversationId = string & { readonly __brand: unique symbol }

// Message roles and states
export const MessageRoles = ['user', 'assistant', 'provider', 'system'] as const
export type MessageRole = DbMessageRole

// Domain-specific status types
export const HandoffStatuses = ['pending', 'completed', 'rejected'] as const
export type HandoffStatus = (typeof HandoffStatuses)[number]

export const ChatSessionStatuses = ['active', 'waiting_provider', 'with_provider', 'completed'] as const
export type ChatSessionStatus = (typeof ChatSessionStatuses)[number]

export const TriageDecisions = [
  'EXISTING_PROVIDER',
  'NEW_TICKET',
  'CONTINUE_GATHERING',
  'EMERGENCY'
] as const
export type TriageDecision = (typeof TriageDecisions)[number]

// Message metadata types
export type MessageMetadata = 
  | { 
      type: 'ai_processing'
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
      handoffStatus: HandoffStatus
      providerId: UserId
      triageDecision: TriageDecision
    }
  | {
      type: 'standard'
    }

// Chat access types
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

// Base conversation type
export interface MedicalConversation extends Omit<MedicalConversationsRow, 'access'> {
  messages: MedicalMessagesRow[]
  access: ChatAccess
}

// Re-export message type for convenience
export type { MedicalMessagesRow }

// Chat session type
export interface ChatSession {
  id: ConversationId
  patientId: UserId
  messages: MedicalMessagesRow[]
  access: ChatAccess
  status: ChatSessionStatus
  messageCount: number
  lastMessageAt: Date
} 