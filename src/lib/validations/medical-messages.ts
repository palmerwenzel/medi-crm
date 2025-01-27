import { z } from 'zod'
import type { Message, MessageInsert } from '@/types/domain/chat'
import { messageRoleEnum } from './shared-enums'
import { rawToConversationIdSchema } from './shared-schemas'
import { messageMetadataSchema } from './message-metadata'

// Base message schema (for database -> domain)
export const medicalMessagesRowSchema = z.object({
  id: z.string(),
  conversation_id: rawToConversationIdSchema,
  created_at: z.string().nullable(),
  content: z.string(),
  metadata: messageMetadataSchema,
  role: messageRoleEnum
}) satisfies z.ZodType<Message>

export type MedicalMessagesRow = z.infer<typeof medicalMessagesRowSchema>

// Insert schema (for domain -> database)
export const medicalMessagesInsertSchema = z.object({
  id: z.string().optional(),
  conversation_id: rawToConversationIdSchema,
  created_at: z.string().nullable().optional(),
  content: z.string(),
  metadata: messageMetadataSchema.optional(),
  role: messageRoleEnum
}) satisfies z.ZodType<MessageInsert>

export type MedicalMessagesInsert = z.infer<typeof medicalMessagesInsertSchema>

// Update schema
export const medicalMessagesUpdateSchema = medicalMessagesInsertSchema.partial()
export type MedicalMessagesUpdate = z.infer<typeof medicalMessagesUpdateSchema>