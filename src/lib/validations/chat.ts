import { z } from 'zod'
import type { Json } from '@/types/supabase'
import { 
  MessageRoles, 
  HandoffStatuses, 
  TriageDecisions
} from '@/types/domain/chat'
import { MessageStatuses } from '@/types/domain/ui'
import type { ChatMessage } from '@/types/domain/chat'
import { messageMetadataSchema } from './message-metadata'

// Enum schemas
export const messageRoleEnum = z.enum(MessageRoles)
export const chatMessageRoleEnum = z.enum(['user', 'assistant'] as const)
export const messageStatusEnum = z.enum(MessageStatuses)
export const handoffStatusEnum = z.enum(HandoffStatuses)
export const triageDecisionEnum = z.enum(TriageDecisions)
export const conversationStatusEnum = z.enum(['active', 'archived'])

// Base message schema
export const messageSchema = z.object({
  id: z.string(),
  conversation_id: z.string(),
  content: z.string(),
  role: messageRoleEnum,
  created_at: z.string(),
  metadata: messageMetadataSchema
})

/**
 * Message validation schemas
 */
export const messageInsertSchema = z.object({
  conversation_id: z.string(),
  content: z.string(),
  role: chatMessageRoleEnum,
  metadata: messageMetadataSchema
})

// Conversation schemas
export const conversationSchema = z.object({
  id: z.string(),
  patient_id: z.string(),
  assigned_staff_id: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  status: conversationStatusEnum,
  topic: z.string().nullable(),
  metadata: z.custom<Json>(),
  case_id: z.string().nullable().optional(),
  can_create_case: z.boolean().optional(),
  access: z.object({
    can_access: z.enum(['ai', 'provider', 'both']),
    provider_id: z.string().optional(),
    handoff_timestamp: z.string().optional()
  }).optional()
})

export const conversationInsertSchema = conversationSchema.pick({
  patient_id: true,
  assigned_staff_id: true,
  status: true,
  topic: true,
  metadata: true,
  case_id: true,
  can_create_case: true,
  access: true
}).partial({
  assigned_staff_id: true,
  topic: true,
  metadata: true,
  case_id: true,
  can_create_case: true,
  access: true
})

// Message state schema
export const messageStateSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('sending'),
    tempId: z.string()
  }),
  z.object({
    status: z.literal('sent'),
    id: z.string()
  }),
  z.object({
    status: z.literal('error'),
    error: z.string()
  })
])

// UI message schema
export const uiMessageSchema = z.object({
  id: z.string(),
  conversation_id: z.string(),
  content: z.string(),
  role: messageRoleEnum,
  created_at: z.string(),
  state: messageStateSchema,
  metadata: messageMetadataSchema
})

/**
 * Conversation validation schemas
 */
export const conversationQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(20),
  status: z.enum(['active', 'archived']).optional()
})

// Query parameter schemas
export const messageQuerySchema = z.object({
  conversation_id: z.string(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(20)
})

// Export inferred types
export type Message = z.infer<typeof messageSchema>
export type MessageInsertSchema = z.infer<typeof messageInsertSchema>
export type MessageMetadata = z.infer<typeof messageMetadataSchema>
export type UIMessage = z.infer<typeof uiMessageSchema>
export type Conversation = z.infer<typeof conversationSchema>
export type MessageQuerySchema = z.infer<typeof messageQuerySchema>
export type ConversationQuerySchema = z.infer<typeof conversationQuerySchema>

export const chatMessageSchema = z.object({
  id: z.string(),
  conversation_id: z.string(),
  role: chatMessageRoleEnum,
  content: z.string(),
  metadata: messageMetadataSchema,
  created_at: z.string(),
  updated_at: z.string()
}) satisfies z.ZodType<ChatMessage> 