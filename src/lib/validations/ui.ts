import { z } from 'zod'
import type { UIMessage, MessageState, MessageStatus, CaseUIMetadata } from '@/types/domain/ui'
import type { MessageMetadata } from '@/types/domain/chat'
import { messageRoleEnum } from './shared-enums'
import { conversationIdSchema } from './shared-schemas'
import { 
  standardMetadataSchema, 
  aiProcessingMetadataSchema, 
  handoffMetadataSchema 
} from './message-metadata'

// Case UI metadata schema
export const caseUIMetadataSchema = z.object({
  sla: z.object({
    response_target: z.string(),
    resolution_target: z.string(),
    last_updated: z.string()
  }).optional(),
  tags: z.array(z.string()).optional(),
  internal_notes: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  chat_status: z.enum(['active', 'closed']).optional()
}) satisfies z.ZodType<CaseUIMetadata>

// Type guard for UI metadata
export function isCaseUIMetadata(metadata: unknown): metadata is CaseUIMetadata {
  if (!metadata || typeof metadata !== 'object') return false
  
  const m = metadata as Record<string, unknown>
  if (m.sla) {
    const sla = m.sla as Record<string, unknown>
    if (typeof sla.response_target !== 'string' ||
        typeof sla.resolution_target !== 'string' ||
        typeof sla.last_updated !== 'string') {
      return false
    }
  }
  
  if (m.tags && !Array.isArray(m.tags)) return false
  if (m.internal_notes && typeof m.internal_notes !== 'string') return false
  if (m.specialties && !Array.isArray(m.specialties)) return false
  if (m.chat_status && !['active', 'closed'].includes(m.chat_status as string)) return false
  
  return true
}

// Message state and status enums
export const messageStateEnum = z.enum(['sending', 'sent', 'error'])
export const messageStatusEnum = z.enum(['pending', 'sent', 'delivered', 'read'])

// Message state schema as discriminated union
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
]) satisfies z.ZodType<MessageState>

// UI metadata schemas with status
const uiStandardMetadataSchema = standardMetadataSchema.merge(
  z.object({ status: messageStatusEnum })
)

const uiAiProcessingMetadataSchema = aiProcessingMetadataSchema.merge(
  z.object({ status: messageStatusEnum })
)

const uiHandoffMetadataSchema = handoffMetadataSchema.merge(
  z.object({ status: messageStatusEnum })
)

// Combined UI metadata schema
export const uiMessageMetadataSchema = z.discriminatedUnion('type', [
  uiStandardMetadataSchema,
  uiAiProcessingMetadataSchema,
  uiHandoffMetadataSchema
]) satisfies z.ZodType<MessageMetadata & { status: MessageStatus }>

// UI Message schema (expects already branded types)
export const uiMessageSchema = z.object({
  id: z.string(),
  conversation_id: conversationIdSchema,
  created_at: z.string().nullable(),
  content: z.string(),
  role: messageRoleEnum,
  state: messageStateSchema,
  metadata: uiMessageMetadataSchema
}) satisfies z.ZodType<UIMessage>

export type UIMessageValidation = z.infer<typeof uiMessageSchema> 