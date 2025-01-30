import { z } from 'zod'
import type { 
  Case, 
  CaseInsert, 
  CaseUpdate, 
  CaseResponse,
  CaseQueryParams,
  CaseMetadata,
  CaseSortField,
  CaseAssessmentResponse,
  CaseFilters,
  SLAMetadata,
  CaseManagementOptions
} from '@/types/domain/cases'
import type { Json } from '@/types/supabase'
import {
  caseCategoryEnum,
  casePriorityEnum,
  caseStatusEnum,
  departmentEnum,
  userRoleEnum,
  assessmentStatusEnum,
  assessmentCreatorTypeEnum,
  conversationStatusEnum,
  staffSpecialtyEnum
} from '@/lib/validations/shared-enums'
import { jsonSchema } from '@/lib/validations/shared-schemas'

// Metadata schemas
const caseMetadataSchema = z.object({
  source: z.enum(['web', 'mobile', 'phone']).optional(),
  tags: z.array(z.string()).optional(),
  custom_fields: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  last_contact: z.string().optional(),
  follow_up_date: z.string().optional()
}) satisfies z.ZodType<CaseMetadata>

const slaMetadataSchema = z.object({
  sla_breached: z.boolean(),
  response_target: z.string(),
  resolution_target: z.string(),
  first_response_at: z.string().nullable(),
  sla_tier: z.string()
}) satisfies z.ZodType<SLAMetadata>

// Base case schema
export const casesRowSchema = z.object({
  id: z.string(),
  assigned_to: z.string().nullable(),
  attachments: jsonSchema.nullable(),
  category: caseCategoryEnum,
  created_at: z.string(),
  department: departmentEnum.nullable(),
  description: z.string(),
  internal_notes: z.string().nullable(),
  metadata: caseMetadataSchema.nullable(),
  patient_id: z.string(),
  priority: casePriorityEnum,
  status: caseStatusEnum,
  title: z.string(),
  updated_at: z.string(),
}) satisfies z.ZodType<Case>

export type CasesRow = z.infer<typeof casesRowSchema>

// Schema for joined user fields
const userFieldsSchema = z.object({
  id: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable()
})

const staffFieldsSchema = z.object({
  id: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  role: userRoleEnum,
  specialty: z.string().nullable()
})

// Base case response schema without assessment
const baseCaseResponseSchema = z.object({
  id: z.string(),
  assigned_to: staffFieldsSchema.nullable(),
  attachments: jsonSchema.nullable(),
  category: caseCategoryEnum,
  created_at: z.string(),
  department: departmentEnum.nullable(),
  description: z.string(),
  internal_notes: z.string().nullable(),
  metadata: caseMetadataSchema.nullable(),
  patient: userFieldsSchema.nullable(),
  patient_id: z.string(),
  priority: casePriorityEnum,
  status: caseStatusEnum,
  title: z.string(),
  updated_at: z.string(),
})

// Assessment response schema
const assessmentResponseSchema: z.ZodType<CaseAssessmentResponse> = z.object({
  id: z.string(),
  key_symptoms: z.array(z.string()),
  recommended_specialties: z.array(z.string()),
  urgency_indicators: z.array(z.string()),
  notes: z.string().nullable(),
  status: assessmentStatusEnum,
  created_at: z.string(),
  updated_at: z.string(),
  created_by_type: assessmentCreatorTypeEnum,
  case: z.lazy(() => baseCaseResponseSchema),
  creator: z.object({
    id: z.string(),
    first_name: z.string().nullable(),
    last_name: z.string().nullable(),
    role: z.string()
  })
})

// Full case response schema with assessment
export const caseResponseSchema = baseCaseResponseSchema.extend({
  latest_assessment: assessmentResponseSchema.optional()
}) satisfies z.ZodType<CaseResponse>

export type CaseResponseRow = z.infer<typeof caseResponseSchema>

// Insert schema - enforcing required fields
export const casesInsertSchema = z.object({
  assigned_to: z.string().nullable().optional(),
  attachments: jsonSchema.nullable().optional(),
  category: caseCategoryEnum,
  created_at: z.string().optional(),
  department: departmentEnum.nullable().optional(),
  description: z.string(),
  id: z.string().optional(),
  internal_notes: z.string().nullable().optional(),
  metadata: caseMetadataSchema.nullable().optional(),
  patient_id: z.string(),
  priority: casePriorityEnum,
  status: caseStatusEnum,
  title: z.string(),
  updated_at: z.string().optional(),
}) satisfies z.ZodType<CaseInsert>

export type CasesInsert = z.infer<typeof casesInsertSchema>

// Update schema
export const casesUpdateSchema = casesInsertSchema.partial() satisfies z.ZodType<CaseUpdate>
export type CasesUpdate = z.infer<typeof casesUpdateSchema>

// Management options schema
export const caseManagementOptionsSchema = z.object({
  limit: z.number().optional(),
  isDashboard: z.boolean().optional()
}) satisfies z.ZodType<CaseManagementOptions>

// Date range schema with proper Date instance validation
const dateRangeSchema = z.object({
  from: z.instanceof(Date).optional(),
  to: z.instanceof(Date).optional()
})

// Query schema with proper filter typing
export const caseQuerySchema = z.object({
  search: z.string().optional(),
  status: z.union([
    caseStatusEnum,
    z.array(caseStatusEnum),
    z.literal('all')
  ]).optional(),
  priority: z.union([
    casePriorityEnum,
    z.array(casePriorityEnum),
    z.literal('all')
  ]).optional(),
  category: z.union([
    caseCategoryEnum,
    z.array(caseCategoryEnum),
    z.literal('all')
  ]).optional(),
  department: z.union([
    departmentEnum,
    z.array(departmentEnum),
    z.literal('all')
  ]).optional(),
  specialty: z.union([
    staffSpecialtyEnum,
    z.literal('all')
  ]).optional(),
  chat_status: z.union([
    conversationStatusEnum,
    z.literal('all')
  ]).optional(),
  tags: z.union([
    z.array(z.string()),
    z.literal('all')
  ]).optional(),
  sort_by: z.custom<CaseSortField>().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  date_range: dateRangeSchema.optional(),
  has_assessment: z.boolean().optional(),
  assessment_creator: z.union([
    assessmentCreatorTypeEnum,
    z.literal('all')
  ]).optional(),
  offset: z.number().int().nonnegative().default(0),
  limit: z.number().int().positive().max(100).default(50)
}) satisfies z.ZodType<CaseFilters>

export type CaseQuery = z.infer<typeof caseQuerySchema>

// Bulk operation schemas
export const bulkStatusUpdateSchema = z.object({
  case_ids: z.array(z.string()),
  status: caseStatusEnum
})

export const bulkAssignmentUpdateSchema = z.object({
  case_ids: z.array(z.string()),
  user_id: z.string()
})

export type BulkStatusUpdate = z.infer<typeof bulkStatusUpdateSchema>
export type BulkAssignmentUpdate = z.infer<typeof bulkAssignmentUpdateSchema>

// Response types for bulk operations
export interface BulkUpdateResponse {
  updated: string[]
  failed: string[]
  errors: Record<string, string>
}

// Response type for paginated cases
export interface PaginatedCasesResponse {
  cases: CaseResponse[]
  total: number
  hasMore: boolean
  nextOffset?: number
}