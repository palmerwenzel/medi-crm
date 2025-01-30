import { z } from 'zod'
import type { 
  CaseAssessment, 
  CaseAssessmentInsert, 
  CaseAssessmentUpdate,
  CaseAssessmentResponse
} from '@/types/domain/cases'
import { 
  userRoleEnum,
  assessmentCreatorTypeEnum,
  assessmentStatusEnum
} from './shared-enums'
import { caseResponseSchema, casesRowSchema } from './cases'

// Schema for joined user fields
const creatorSchema = z.object({
  id: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  role: z.string()
})

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
  updated_at: z.string(),
  case: casesRowSchema.optional(),
  creator: creatorSchema.optional()
}) satisfies z.ZodType<CaseAssessment>

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
}) satisfies z.ZodType<CaseAssessmentResponse>

// Insert schema
export const caseAssessmentInsertSchema = z.object({
  case_id: z.string(),
  created_by: z.string(),
  created_by_type: assessmentCreatorTypeEnum,
  key_symptoms: z.array(z.string()),
  recommended_specialties: z.array(z.string()),
  urgency_indicators: z.array(z.string()),
  notes: z.string().nullable(),
  status: assessmentStatusEnum
}) satisfies z.ZodType<CaseAssessmentInsert>

// Update schema
export const caseAssessmentUpdateSchema = caseAssessmentInsertSchema.partial() satisfies z.ZodType<CaseAssessmentUpdate>

// Types
export type CaseAssessmentRow = z.infer<typeof caseAssessmentSchema>
export type CaseAssessmentResponseRow = z.infer<typeof caseAssessmentResponseSchema>
export type CaseAssessmentInsertRow = z.infer<typeof caseAssessmentInsertSchema>
export type CaseAssessmentUpdateRow = z.infer<typeof caseAssessmentUpdateSchema> 