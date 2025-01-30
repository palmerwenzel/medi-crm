import { z } from 'zod'
import type { Json } from '@/types/supabase'
import { 
  MessageRoles, 
  HandoffStatuses, 
  TriageDecisions,
  ChatSessionStatuses,
  type MessageRole,
  type HandoffStatus,
  type TriageDecision,
  type ChatSessionStatus,
  type ChatMessage,
  type ConversationId,
  type MessageUpdate,
  type ConversationUpdate
} from '@/types/domain/chat'
import type { UserId } from '@/types/domain/users'
import { MessageStatuses } from '@/types/domain/ui'
import { messageMetadataSchema } from './message-metadata'

// Enum schemas
export const messageRoleEnum = z.enum(MessageRoles)
export const chatMessageRoleEnum = z.enum(['user', 'assistant'] as const)
export const messageStatusEnum = z.enum(MessageStatuses)
export const handoffStatusEnum = z.enum(HandoffStatuses)
export const triageDecisionEnum = z.enum(TriageDecisions)
export const chatSessionStatusEnum = z.enum(ChatSessionStatuses)
export const conversationStatusEnum = z.enum(['active', 'archived'])

// Collected medical info schema
export const collectedMedicalInfoSchema = z.object({
  chief_complaint: z.string().optional(),
  duration: z.string().optional(),
  severity: z.string().optional(),
  existing_provider: z.string().optional(),
  key_symptoms: z.array(z.string()).optional(),
  recommended_specialties: z.array(z.string()).optional()
})

// Chat access schema
export const chatAccessSchema = z.discriminatedUnion('can_access', [
  z.object({
    can_access: z.literal('ai')
  }),
  z.object({
    can_access: z.literal('provider'),
    provider_id: z.string().transform((id): UserId => id as UserId)
  }),
  z.object({
    can_access: z.literal('both'),
    provider_id: z.string().transform((id): UserId => id as UserId).optional(),
    handoff_timestamp: z.string().optional()
  })
])

// Base message schema
export const messageSchema = z.object({
  id: z.string(),
  conversation_id: z.string().transform((id): ConversationId => id as ConversationId),
  content: z.string(),
  role: messageRoleEnum,
  created_at: z.string(),
  metadata: messageMetadataSchema
})

/**
 * Message validation schemas
 */
export const messageInsertSchema = z.object({
  conversation_id: z.string().transform((id): ConversationId => id as ConversationId),
  content: z.string(),
  role: chatMessageRoleEnum,
  metadata: messageMetadataSchema
})

export const messageUpdateSchema = messageInsertSchema.partial() satisfies z.ZodType<MessageUpdate>

// Conversation schemas
export const conversationSchema = z.object({
  id: z.string().transform((id): ConversationId => id as ConversationId),
  patient_id: z.string().transform((id): UserId => id as UserId),
  assigned_staff_id: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  status: conversationStatusEnum,
  topic: z.string().nullable(),
  metadata: z.custom<Json>(),
  case_id: z.string().nullable().optional(),
  can_create_case: z.boolean().optional(),
  access: chatAccessSchema
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

export const conversationUpdateSchema = conversationInsertSchema.partial() satisfies z.ZodType<ConversationUpdate>

// Medical conversation schema with messages
export const medicalConversationSchema = conversationSchema.extend({
  messages: z.array(messageSchema),
  access: chatAccessSchema,
  status: conversationStatusEnum
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
  conversation_id: z.string().transform((id): ConversationId => id as ConversationId),
  content: z.string(),
  role: messageRoleEnum,
  created_at: z.string(),
  state: messageStateSchema,
  metadata: messageMetadataSchema
})

// Chat session schema
export const chatSessionSchema = z.object({
  id: z.string().transform((id): ConversationId => id as ConversationId),
  patientId: z.string().transform((id): UserId => id as UserId),
  messages: z.array(messageSchema),
  access: chatAccessSchema,
  status: chatSessionStatusEnum,
  messageCount: z.number(),
  lastMessageAt: z.date()
})

/**
 * Conversation validation schemas
 */
export const conversationQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(20),
  status: conversationStatusEnum.optional()
})

// Query parameter schemas
export const messageQuerySchema = z.object({
  conversation_id: z.string().transform((id): ConversationId => id as ConversationId),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(20)
})

// Chat message schema
export const chatMessageSchema = z.object({
  id: z.string(),
  conversation_id: z.string().transform((id): ConversationId => id as ConversationId),
  role: chatMessageRoleEnum,
  content: z.string(),
  metadata: messageMetadataSchema,
  created_at: z.string(),
  updated_at: z.string()
}) satisfies z.ZodType<ChatMessage>

// Export types
export type {
  MessageRole,
  HandoffStatus,
  TriageDecision,
  ChatSessionStatus,
  ChatMessage,
  ChatAccess,
  CollectedMedicalInfo,
  MessageMetadata,
  ChatSession,
  MessageUpdate,
  ConversationUpdate
} from '@/types/domain/chat'

// Export inferred types
export type Message = z.infer<typeof messageSchema>
export type MessageInsertSchema = z.infer<typeof messageInsertSchema>
export type UIMessage = z.infer<typeof uiMessageSchema>
export type Conversation = z.infer<typeof conversationSchema>
export type MessageQuerySchema = z.infer<typeof messageQuerySchema>
export type ConversationQuerySchema = z.infer<typeof conversationQuerySchema> 