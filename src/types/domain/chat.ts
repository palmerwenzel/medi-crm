import type { UserId } from './users'
import type { 
  DbMessageRole, 
  DbMedicalMessage,
  DbMedicalConversation,
  DbConversationStatus
} from './db'

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
  'EMERGENCY',
  'URGENT',
  'NON_URGENT',
  'SELF_CARE'
] as const
export type TriageDecision = (typeof TriageDecisions)[number]

// Message types
export interface Message extends DbMedicalMessage {
  metadata: MessageMetadata
}

export type MessageInsert = Partial<DbMedicalMessage> & {
  conversation_id: string
  role: MessageRole
  content: string
}

export type MessageUpdate = Partial<MessageInsert>

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

// Conversation types
export interface MedicalConversation extends DbMedicalConversation {
  messages: Message[]
  access: ChatAccess
  status: DbConversationStatus
}

export type ConversationInsert = Partial<DbMedicalConversation> & {
  patient_id: string
  status: DbConversationStatus
}

export type ConversationUpdate = Partial<ConversationInsert>

export interface ChatSession {
  id: ConversationId
  patientId: UserId
  messages: Message[]
  access: ChatAccess
  status: ChatSessionStatus
  messageCount: number
  lastMessageAt: Date
} 