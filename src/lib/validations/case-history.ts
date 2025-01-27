import { z } from 'zod'
import { caseActivityTypeEnum } from '@/lib/validations/shared-enums'

export const caseHistoryRowSchema = z.object({
  id: z.string(),
  activity_type: caseActivityTypeEnum,
  actor_id: z.string(),
  case_id: z.string(),
  created_at: z.string(),
  metadata: z.any().nullable(),
  new_value: z.any().nullable(),
  old_value: z.any().nullable(),
})

export type CaseHistoryRow = z.infer<typeof caseHistoryRowSchema>

export const caseHistoryInsertSchema = z.object({
  activity_type: caseActivityTypeEnum,
  actor_id: z.string(),
  case_id: z.string(),
  created_at: z.string().optional(),
  id: z.string().optional(),
  metadata: z.any().nullable().optional(),
  new_value: z.any().nullable().optional(),
  old_value: z.any().nullable().optional(),
})

export type CaseHistoryInsert = z.infer<typeof caseHistoryInsertSchema>

export const caseHistoryUpdateSchema = caseHistoryInsertSchema.partial()
export type CaseHistoryUpdate = z.infer<typeof caseHistoryUpdateSchema>