import { z } from 'zod'
import type { Message, MessageInsert, MessageUpdate } from '@/types/domain/chat'
import { messageRoleEnum } from './shared-enums'
import { rawToConversationIdSchema } from './shared-schemas'
import { messageMetadataSchema } from './message-metadata'

// Base message schema (for database -> domain)
export const medicalMessagesRowSchema = z.object({
  id: z.string(),
  conversation_id: rawToConversationIdSchema,
  content: z.string(),
  role: messageRoleEnum,
  created_at: z.string(),
  metadata: messageMetadataSchema
}) satisfies z.ZodType<Message>

export type MedicalMessagesRow = z.infer<typeof medicalMessagesRowSchema>

// Insert schema (for domain -> database)
export const medicalMessagesInsertSchema = z.object({
  conversation_id: rawToConversationIdSchema,
  content: z.string(),
  role: messageRoleEnum,
  metadata: messageMetadataSchema.optional(),
  id: z.string().optional(),
  created_at: z.string().optional()
}) satisfies z.ZodType<MessageInsert>

export type MedicalMessagesInsert = z.infer<typeof medicalMessagesInsertSchema>

// Update schema
export const medicalMessagesUpdateSchema = medicalMessagesInsertSchema.partial() satisfies z.ZodType<MessageUpdate>
export type MedicalMessagesUpdate = z.infer<typeof medicalMessagesUpdateSchema>

// Query parameter schemas
export const medicalMessagesQuerySchema = z.object({
  conversation_id: rawToConversationIdSchema,
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(20)
})