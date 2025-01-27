/**
 * System User Roles - Who the user is in the system
 */
export type UserRole = 'admin' | 'staff' | 'patient'

/**
 * Message Roles - Who sent the message in a chat
 */
export type MessageRole = 'user' | 'assistant'

/**
 * OpenAI Roles - Used when sending messages to OpenAI
 */
export type OpenAIRole = 'system' | 'user' | 'assistant'

/**
 * Transforms a MessageRole to an OpenAIRole
 * Used when preparing messages for OpenAI API calls
 */
export function toOpenAIRole(role: MessageRole): OpenAIRole {
  return role // They happen to match, but we're explicit about the transformation
}

/**
 * Type guard to check if a string is a valid MessageRole
 */
export function isMessageRole(role: string): role is MessageRole {
  return role === 'user' || role === 'assistant'
}

/**
 * Type guard to check if a string is a valid UserRole
 */
export function isUserRole(role: string): role is UserRole {
  return role === 'admin' || role === 'staff' || role === 'patient'
}

/**
 * Type guard to check if a string is a valid OpenAIRole
 */
export function isOpenAIRole(role: string): role is OpenAIRole {
  return role === 'system' || role === 'user' || role === 'assistant'
} 