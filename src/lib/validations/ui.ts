import { z } from 'zod'
import type { UIMessage, MessageState, MessageStatus } from '@/types/domain/ui'
import type { MessageMetadata } from '@/types/domain/chat'
import { messageRoleEnum } from './shared-enums'
import { conversationIdSchema } from './shared-schemas'
import { 
  standardMetadataSchema, 
  aiProcessingMetadataSchema, 
  handoffMetadataSchema 
} from './message-metadata'

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