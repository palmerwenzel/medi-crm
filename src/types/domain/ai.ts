import type { MessageRole, MessageMetadata, ChatAccess } from './chat'

/**
 * OpenAI request/response types
 */
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

/**
 * Type guards for chat metadata and access
 */
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