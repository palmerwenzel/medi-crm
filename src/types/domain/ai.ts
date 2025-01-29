import type { MessageRole, MessageMetadata, ChatAccess, CollectedMedicalInfo } from './chat'

/**
 * Types for AI chat interactions and data processing
 */

/**
 * Represents a request to the AI service.
 * Used when sending conversation history to the AI for processing.
 */
export interface ChatRequest {
  messages: {
    role: MessageRole
    content: string
  }[]
}

/**
 * Represents the AI's response to a chat request.
 * Contains both the message content and optional metadata about the processing.
 */
export interface ChatResponse {
  message: string
  metadata?: MessageMetadata
}

/**
 * Structured medical data extracted by the AI from conversations.
 * Extends CollectedMedicalInfo with additional fields specific to AI processing.
 */
export interface ExtractedAIData extends CollectedMedicalInfo {
  medications?: string[]      // List of medications mentioned
  allergies?: string[]       // Known allergies
  medicalHistory?: string[]  // Relevant medical history items
  vitals?: {                 // Patient vital signs if mentioned
    temperature?: string
    bloodPressure?: string
    heartRate?: string
    respiratoryRate?: string
    oxygenSaturation?: string
  }
}

/**
 * Type Guards for Message Metadata and Chat Access
 */

/**
 * Checks if metadata is from AI processing phase.
 * Used to safely access AI-specific metadata fields.
 */
export function isAIProcessingMetadata(
  metadata: MessageMetadata
): metadata is Extract<MessageMetadata, { type: 'ai_processing' }> {
  return metadata.type === 'ai_processing'
}

/**
 * Checks if metadata is from handoff phase.
 * Used to safely access handoff-specific metadata fields.
 */
export function isHandoffMetadata(
  metadata: MessageMetadata
): metadata is Extract<MessageMetadata, { type: 'handoff' }> {
  return metadata.type === 'handoff'
}

/**
 * Checks if chat access is provider-only.
 * Used to determine if the chat is in provider-only mode.
 */
export function isProviderAccess(
  access: ChatAccess
): access is Extract<ChatAccess, { can_access: 'provider' }> {
  return access.can_access === 'provider'
}

/**
 * Checks if chat access is both AI and provider.
 * Used to determine if both AI and providers can participate in the chat.
 */
export function isBothAccess(
  access: ChatAccess
): access is Extract<ChatAccess, { can_access: 'both' }> {
  return access.can_access === 'both'
} 