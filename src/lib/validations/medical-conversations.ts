import { z } from 'zod'
import type { MedicalConversation, ConversationInsert } from '@/types/domain/chat'
import type { UserId } from '@/types/domain/users'
import { rawToConversationIdSchema, rawToUserIdSchema, userIdSchema, jsonSchema } from './shared-schemas'
import { medicalMessagesRowSchema } from './medical-messages'

// Chat access schema
const chatAccessSchema = z.discriminatedUnion('can_access', [
  z.object({
    can_access: z.literal('ai')
  }),
  z.object({
    can_access: z.literal('provider'),
    provider_id: userIdSchema
  }),
  z.object({
    can_access: z.literal('both'),
    provider_id: userIdSchema.optional(),
    handoff_timestamp: z.string().optional()
  })
])

// Base conversation schema (for database -> domain)
export const medicalConversationsRowSchema = z.object({
  id: rawToConversationIdSchema,
  patient_id: rawToUserIdSchema,
  assigned_staff_id: rawToUserIdSchema.nullable(),
  case_id: z.string().nullable(),
  can_create_case: z.boolean().nullable(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  status: z.enum(['active', 'archived']),
  topic: z.string().nullable(),
  metadata: jsonSchema.nullable(),
  messages: z.array(medicalMessagesRowSchema),
  access: chatAccessSchema
}) satisfies z.ZodType<MedicalConversation>

export type MedicalConversationsRow = z.infer<typeof medicalConversationsRowSchema>

// Insert schema (for domain -> database)
export const medicalConversationsInsertSchema = z.object({
  patient_id: rawToUserIdSchema,
  assigned_staff_id: rawToUserIdSchema.nullable().optional(),
  case_id: z.string().nullable().optional(),
  can_create_case: z.boolean().nullable().optional(),
  status: z.enum(['active', 'archived']),
  topic: z.string().nullable().optional(),
  metadata: jsonSchema.nullable().optional(),
  access: chatAccessSchema.optional()
}) satisfies z.ZodType<ConversationInsert>

export type MedicalConversationsInsert = z.infer<typeof medicalConversationsInsertSchema>

// Update schema
export const medicalConversationsUpdateSchema = medicalConversationsInsertSchema.partial()
export type MedicalConversationsUpdate = z.infer<typeof medicalConversationsUpdateSchema>

// Query parameter schemas
export const medicalConversationsQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(20),
  status: z.enum(['active', 'archived']).optional()
})