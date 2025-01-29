import { z } from 'zod'
import type { 
  CaseAssessment, 
  CaseAssessmentInsert, 
  CaseAssessmentUpdate,
  CaseAssessmentResponse
} from '@/types/domain/cases'
import { userRoleEnum } from './shared-enums'
import { caseResponseSchema } from './cases'

// Enums
export const assessmentCreatorTypeEnum = z.enum(['ai', 'staff', 'admin'])
export const assessmentStatusEnum = z.enum(['active', 'superseded'])

// Base schema for case assessments
export const caseAssessmentSchema = z.object({
  id: z.string(),
  case_id: z.string(),
  created_at: z.string(),
  created_by: z.string(),
  created_by_type: assessmentCreatorTypeEnum,
  key_symptoms: z.array(z.string()),
  recommended_specialties: z.array(z.string()),
  urgency_indicators: z.array(z.string()),
  notes: z.string().nullable(),
  status: assessmentStatusEnum,
  updated_at: z.string()
}) satisfies z.ZodType<CaseAssessment>

// Schema for joined user fields
const creatorSchema = z.object({
  id: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  role: userRoleEnum
})

// Response schema (with joined fields)
export const caseAssessmentResponseSchema = z.object({
  id: z.string(),
  key_symptoms: z.array(z.string()),
  recommended_specialties: z.array(z.string()),
  urgency_indicators: z.array(z.string()),
  notes: z.string().nullable(),
  status: assessmentStatusEnum,
  created_at: z.string(),
  updated_at: z.string(),
  created_by_type: assessmentCreatorTypeEnum,
  case: caseResponseSchema,
  creator: creatorSchema
}).transform((data): CaseAssessmentResponse => ({
  ...data,
  id: data.id,
  key_symptoms: data.key_symptoms,
  recommended_specialties: data.recommended_specialties,
  urgency_indicators: data.urgency_indicators,
  notes: data.notes,
  status: data.status,
  created_at: data.created_at,
  updated_at: data.updated_at,
  created_by_type: data.created_by_type,
  case: data.case,
  creator: data.creator
}))

// Insert schema
export const caseAssessmentInsertSchema = caseAssessmentSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
}) satisfies z.ZodType<CaseAssessmentInsert>

// Update schema
export const caseAssessmentUpdateSchema = caseAssessmentInsertSchema.partial() satisfies z.ZodType<CaseAssessmentUpdate>

// Types
export type CaseAssessmentRow = z.infer<typeof caseAssessmentSchema>
export type CaseAssessmentResponseRow = z.infer<typeof caseAssessmentResponseSchema>
export type CaseAssessmentInsertRow = z.infer<typeof caseAssessmentInsertSchema>
export type CaseAssessmentUpdateRow = z.infer<typeof caseAssessmentUpdateSchema> 