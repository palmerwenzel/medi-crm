import { z } from 'zod'
import { messageRoleEnum } from '@/lib/validations/shared-enums'

export const medicalMessagesRowSchema = z.object({
  id: z.string(),
  conversation_id: z.string(),
  created_at: z.string().nullable(),
  content: z.string(),
  metadata: z.any().nullable(),
  role: messageRoleEnum,
})

export type MedicalMessagesRow = z.infer<typeof medicalMessagesRowSchema>

export const medicalMessagesInsertSchema = z.object({
  id: z.string().optional(),
  conversation_id: z.string(),
  created_at: z.string().nullable().optional(),
  content: z.string(),
  metadata: z.any().nullable().optional(),
  role: messageRoleEnum,
})

export type MedicalMessagesInsert = z.infer<typeof medicalMessagesInsertSchema>

export const medicalMessagesUpdateSchema = medicalMessagesInsertSchema.partial()
export type MedicalMessagesUpdate = z.infer<typeof medicalMessagesUpdateSchema>