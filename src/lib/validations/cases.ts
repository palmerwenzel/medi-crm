import { z } from 'zod'
import type { 
  Case, 
  CaseInsert, 
  CaseUpdate, 
  CaseResponse,
  CaseQueryParams,
  CaseSortField 
} from '@/types/domain/cases'
import {
  caseCategoryEnum,
  casePriorityEnum,
  caseStatusEnum,
  departmentEnum,
  userRoleEnum
} from '@/lib/validations/shared-enums'
import { jsonSchema } from '@/lib/validations/shared-schemas'

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
  metadata: jsonSchema.nullable(),
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

// Case response schema (with joined fields)
export const caseResponseSchema = z.object({
  id: z.string(),
  assigned_to: staffFieldsSchema.nullable(),
  attachments: jsonSchema.nullable(),
  category: caseCategoryEnum,
  created_at: z.string(),
  department: departmentEnum.nullable(),
  description: z.string(),
  internal_notes: z.string().nullable(),
  metadata: jsonSchema.nullable(),
  patient: userFieldsSchema.nullable(),
  patient_id: z.string(),
  priority: casePriorityEnum,
  status: caseStatusEnum,
  title: z.string(),
  updated_at: z.string(),
}) satisfies z.ZodType<CaseResponse>

export type CaseResponseRow = z.infer<typeof caseResponseSchema>

// Insert schema
export const casesInsertSchema = z.object({
  assigned_to: z.string().nullable().optional(),
  attachments: jsonSchema.nullable().optional(),
  category: caseCategoryEnum,
  created_at: z.string().optional(),
  department: departmentEnum.nullable().optional(),
  description: z.string(),
  id: z.string().optional(),
  internal_notes: z.string().nullable().optional(),
  metadata: jsonSchema.nullable().optional(),
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

// Query schema
export const caseQuerySchema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
  sort_by: z.enum(['status', 'department', 'id', 'assigned_to', 'attachments', 'category', 'created_at', 'description', 'internal_notes', 'metadata', 'patient_id', 'priority', 'title', 'updated_at'] as const).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  status: caseStatusEnum.optional(),
  priority: casePriorityEnum.optional(),
  category: caseCategoryEnum.optional(),
  department: departmentEnum.optional(),
  assigned_to: z.string().optional(),
  search: z.string().optional()
}) satisfies z.ZodType<CaseQueryParams>

export type CaseQuery = z.infer<typeof caseQuerySchema>