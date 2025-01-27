import { z } from 'zod'
import {
  caseCategoryEnum,
  casePriorityEnum,
  caseStatusEnum,
  departmentEnum
} from '@/lib/validations/shared-enums'

export const casesRowSchema = z.object({
  id: z.string(),
  assigned_to: z.string().nullable(),
  attachments: z.any(), 
  category: caseCategoryEnum,
  created_at: z.string(),
  department: departmentEnum.nullable(),
  description: z.string(),
  internal_notes: z.string().nullable(),
  metadata: z.any(),
  patient_id: z.string(),
  priority: casePriorityEnum,
  status: caseStatusEnum,
  title: z.string(),
  updated_at: z.string(),
})

export type CasesRow = z.infer<typeof casesRowSchema>

export const casesInsertSchema = z.object({
  assigned_to: z.string().nullable().optional(),
  attachments: z.any().optional(),
  category: caseCategoryEnum.optional(),
  created_at: z.string().optional(),
  department: departmentEnum.nullable().optional(),
  description: z.string(),
  id: z.string().optional(),
  internal_notes: z.string().nullable().optional(),
  metadata: z.any().optional(),
  patient_id: z.string(),
  priority: casePriorityEnum.optional(),
  status: caseStatusEnum.optional(),
  title: z.string(),
  updated_at: z.string().optional(),
})

export type CasesInsert = z.infer<typeof casesInsertSchema>

export const casesUpdateSchema = casesInsertSchema.partial()
export type CasesUpdate = z.infer<typeof casesUpdateSchema>