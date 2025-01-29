import type { UserId } from './users'
import type { 
  DbMessageRole, 
  DbMedicalMessage,
  DbMedicalConversation,
  DbConversationStatus
} from './db'
import type { Json } from '../supabase'

/**
 * Domain types for the medical chat system, including conversations,
 * messages, and AI-to-provider handoff functionality.
 */

/**
 * Branded type for conversation IDs to ensure type safety
 * across the application.
 */
export type ConversationId = string & { readonly __brand: unique symbol }

/**
 * Message role definitions for different participants in the chat
 */
export const MessageRoles = ['user', 'assistant', 'provider', 'system'] as const
export type MessageRole = DbMessageRole

/**
 * Status types for different aspects of the chat system
 */

/**
 * Handoff status tracking when transitioning from AI to provider
 */
export const HandoffStatuses = ['pending', 'completed', 'rejected'] as const
export type HandoffStatus = (typeof HandoffStatuses)[number]

/**
 * Overall chat session status tracking
 */
export const ChatSessionStatuses = ['active', 'waiting_provider', 'with_provider', 'completed'] as const
export type ChatSessionStatus = (typeof ChatSessionStatuses)[number]

/**
 * AI triage decision levels for medical urgency
 */
export const TriageDecisions = [
  'EMERGENCY',   // Immediate medical attention needed
  'URGENT',      // Requires prompt but not immediate care
  'NON_URGENT',  // Can be scheduled for regular care
  'SELF_CARE'    // Can be managed at home with guidance
] as const
export type TriageDecision = (typeof TriageDecisions)[number]

/**
 * Core message type extending database message with structured metadata
 */
export interface Message extends Omit<DbMedicalMessage, 'metadata'> {
  metadata: MessageMetadata
}

/**
 * Medical information collected during chat interactions.
 * Used to gather patient symptoms and medical context.
 */
export interface CollectedMedicalInfo extends Record<string, Json | undefined> {
  chief_complaint?: string            // Primary reason for visit
  duration?: string                   // How long symptoms have been present
  severity?: string                   // Severity of symptoms
  existing_provider?: string          // Current healthcare provider if any
  key_symptoms?: string[]            // List of main symptoms
  recommended_specialties?: string[]  // Medical specialties that should be involved
}

/**
 * Types for message operations
 */
export type MessageInsert = Partial<DbMedicalMessage> & {
  conversation_id: string
  role: MessageRole
  content: string
}

export type MessageUpdate = Partial<MessageInsert>

/**
 * Base metadata shared across all message types.
 * Tracks various flags and information about the message.
 */
type BaseMetadata = {
  case_id?: string                    // Associated medical case
  assessment_id?: string              // Associated medical assessment
  is_case_creation?: boolean          // Whether this creates a new case
  is_assessment_creation?: boolean    // Whether this creates a new assessment
  is_assessment_update?: boolean      // Whether this updates an assessment
  is_case_update?: boolean           // Whether this updates a case
  is_error?: boolean                 // Whether this is an error message
  error_message?: string             // Error details if applicable
  is_final?: boolean                 // Whether this is a final message
  key_symptoms?: string[]            // Identified symptoms
  recommended_specialties?: string[] // Recommended medical specialties
  urgency_indicators?: string[]      // Indicators of medical urgency
  notes?: string | null              // Additional notes
}

/**
 * Metadata types for different message scenarios
 */

/**
 * Metadata for messages during AI processing phase
 */
type AIProcessingMetadata = BaseMetadata & {
  type: 'ai_processing'
  collected_info?: {                  // Information gathered by AI
    chief_complaint?: string
    duration?: string
    severity?: string
  }
  triage_decision?: string           // AI's assessment of urgency
}

/**
 * Metadata for handoff messages when transitioning to provider
 */
type HandoffMetadata = BaseMetadata & {
  type: 'handoff'
  handoff_status: HandoffStatus      // Current handoff state
  provider_id: UserId               // Provider taking over
  triage_decision: TriageDecision   // Final triage assessment
}

/**
 * Metadata for standard chat messages
 */
type StandardMetadata = BaseMetadata & {
  type: 'standard'
}

/**
 * Combined message metadata type using discriminated union
 */
export type MessageMetadata = 
  | AIProcessingMetadata 
  | HandoffMetadata 
  | StandardMetadata

/**
 * Complete chat message structure with metadata
 */
export type ChatMessage = {
  id: string
  conversation_id: string
  role: MessageRole
  content: string
  metadata: MessageMetadata
  created_at: string
  updated_at: string
}

/**
 * Access control for chat conversations.
 * Determines who can participate in the conversation.
 */
export type ChatAccess = 
  | { can_access: 'ai' }              // AI-only access
  | { 
      can_access: 'provider'          // Provider-only access
      provider_id: UserId
    }
  | {
      can_access: 'both'              // Both AI and provider access
      provider_id?: UserId
      handoff_timestamp?: string
    }

/**
 * Conversation types for medical chat system
 */

/**
 * Complete medical conversation with messages and access control
 */
export interface MedicalConversation extends DbMedicalConversation {
  messages: Message[]
  access: ChatAccess
  status: DbConversationStatus
}

/**
 * Types for conversation operations
 */
export type ConversationInsert = Partial<DbMedicalConversation> & {
  patient_id: string
  status: DbConversationStatus
}

export type ConversationUpdate = Partial<ConversationInsert>

/**
 * Active chat session information
 */
export interface ChatSession {
  id: ConversationId
  patientId: UserId
  messages: Message[]
  access: ChatAccess
  status: ChatSessionStatus
  messageCount: number
  lastMessageAt: Date
} 