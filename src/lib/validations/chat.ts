import { z } from 'zod'
import type { Json } from '@/types/supabase'
import { 
  MessageRoles, 
  MessageStatuses, 
  HandoffStatuses, 
  TriageDecisions 
} from '@/types/chat'

// Enum schemas
const messageRoleEnum = z.enum(MessageRoles)
const messageStatusEnum = z.enum(MessageStatuses)
const handoffStatusEnum = z.enum(HandoffStatuses)
const triageDecisionEnum = z.enum(TriageDecisions)
const conversationStatusEnum = z.enum(['active', 'archived'])

// Base message schema
export const messageSchema = z.object({
  id: z.string(),
  conversation_id: z.string(),
  content: z.string(),
  role: z.enum(MessageRoles),
  created_at: z.string(),
  metadata: z.custom<Json>()
})

// Message insert schema
export const messageInsertSchema = messageSchema.partial({
  id: true,
  created_at: true,
  metadata: true
})

// Message metadata schemas
export const aiProcessingMetadataSchema = z.object({
  type: z.literal('ai_processing'),
  status: z.enum(MessageStatuses),
  confidenceScore: z.number().optional(),
  collectedInfo: z.object({
    chiefComplaint: z.string().optional(),
    duration: z.string().optional(),
    severity: z.string().optional(),
    existingProvider: z.string().optional(),
    urgencyIndicators: z.array(z.string())
  }).optional()
})

export const handoffMetadataSchema = z.object({
  type: z.literal('handoff'),
  status: z.enum(MessageStatuses),
  handoffStatus: z.enum(HandoffStatuses),
  providerId: z.string(),
  triageDecision: z.enum(TriageDecisions)
})

export const standardMetadataSchema = z.object({
  type: z.literal('standard'),
  status: z.enum(MessageStatuses)
})

export const metadataSchema = z.discriminatedUnion('type', [
  aiProcessingMetadataSchema,
  handoffMetadataSchema,
  standardMetadataSchema
])

// Conversation schemas
export const conversationSchema = z.object({
  id: z.string(),
  patient_id: z.string(),
  assigned_staff_id: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  status: z.enum(['active', 'archived']),
  topic: z.string().nullable(),
  metadata: z.custom<Json>(),
  case_id: z.string().nullable().optional(),
  can_create_case: z.boolean().optional(),
  access: z.object({
    canAccess: z.enum(['ai', 'provider', 'both']),
    providerId: z.string().optional(),
    handoffTimestamp: z.string().optional()
  }).optional()
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
  role: z.enum(MessageRoles),
  created_at: z.string(),
  state: messageStateSchema,
  metadata: metadataSchema
})

// Query parameter schemas
export const messageQuerySchema = z.object({
  conversation_id: z.string().uuid(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20)
})

export const conversationQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
  status: conversationStatusEnum.optional()
})

// Export inferred types
export type Message = z.infer<typeof messageSchema>
export type MessageInsert = z.infer<typeof messageInsertSchema>
export type MessageMetadata = z.infer<typeof metadataSchema>
export type UIMessage = z.infer<typeof uiMessageSchema>
export type Conversation = z.infer<typeof conversationSchema>
export type MessageQuery = z.infer<typeof messageQuerySchema>
export type ConversationQuery = z.infer<typeof conversationQuerySchema> 