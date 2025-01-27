import { z } from 'zod'
import { conversationStatusEnum } from '@/lib/validations/shared-enums'

export const medicalConversationsRowSchema = z.object({
  id: z.string(),
  access: z.any().nullable(),
  assigned_staff_id: z.string().nullable(),
  can_create_case: z.boolean().nullable(),
  case_id: z.string().nullable(),
  created_at: z.string().nullable(),
  metadata: z.any().nullable(),
  patient_id: z.string(),
  status: conversationStatusEnum.nullable(),
  topic: z.string().nullable(),
  updated_at: z.string().nullable(),
})

export type MedicalConversationsRow = z.infer<typeof medicalConversationsRowSchema>

export const medicalConversationsInsertSchema = z.object({
  id: z.string().optional(),
  access: z.any().nullable().optional(),
  assigned_staff_id: z.string().nullable().optional(),
  can_create_case: z.boolean().nullable().optional(),
  case_id: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  metadata: z.any().nullable().optional(),
  patient_id: z.string(),
  status: conversationStatusEnum.nullable().optional(),
  topic: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
})

export type MedicalConversationsInsert = z.infer<typeof medicalConversationsInsertSchema>

export const medicalConversationsUpdateSchema =
  medicalConversationsInsertSchema.partial()

export type MedicalConversationsUpdate = z.infer<
  typeof medicalConversationsUpdateSchema
>