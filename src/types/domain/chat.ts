import type { UserId } from './users'
import type { 
  DbMessageRole, 
  DbMedicalMessage,
  DbMedicalConversation,
  DbConversationStatus
} from './db'
import type { Json } from '../supabase'

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
export interface Message extends Omit<DbMedicalMessage, 'metadata'> {
  metadata: MessageMetadata
}

/**
 * Shared medical information structure
 */
export interface CollectedMedicalInfo extends Record<string, Json | undefined> {
  chief_complaint?: string
  duration?: string
  severity?: string
  existing_provider?: string
  urgency_indicators: string[]
  key_symptoms?: string[]
  recommended_specialties?: string[]
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
      confidence_score?: number
      collected_info?: CollectedMedicalInfo
  } & Record<string, Json | undefined>
  | ({
      type: 'handoff'
      handoff_status: HandoffStatus
      provider_id: UserId
      triage_decision: TriageDecision
  } & Record<string, Json | undefined>)
  | ({
      type: 'standard'
  } & Record<string, Json | undefined>)

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