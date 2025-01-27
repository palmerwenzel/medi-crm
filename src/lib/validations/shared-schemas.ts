import { z } from 'zod'
import type { Json } from '@/types/supabase'
import type { ConversationId } from '@/types/domain/chat'
import type { UserId } from '@/types/domain/users'

// Helper function to brand a string as a specific type
function brandString<T>(): (str: string) => T {
  return str => str as T
}

// Raw string to branded type schemas (for database -> domain)
export const rawToUserIdSchema = z.string().transform(brandString<UserId>())
export const rawToConversationIdSchema = z.string().transform(brandString<ConversationId>())

// Branded type schemas (for domain -> UI)
export const userIdSchema = z.custom<UserId>((val) => isUserId(val))
export const conversationIdSchema = z.custom<ConversationId>((val) => isConversationId(val))

// JSON schema for metadata
export const jsonSchema: z.ZodType<Json> = z.lazy(() => 
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonSchema),
    z.record(jsonSchema)
  ])
)

// Message role enum
export const messageRoleEnum = z.enum(['user', 'assistant', 'provider', 'system'])

// Type guards for runtime checking
export function isConversationId(value: unknown): value is ConversationId {
  return typeof value === 'string'
}

export function isUserId(value: unknown): value is UserId {
  return typeof value === 'string'
} 