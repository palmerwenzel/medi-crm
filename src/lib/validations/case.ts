/**
 * Case validation schemas and types
 * Uses Zod for runtime validation
 */

import * as z from 'zod'
import type { Database } from '@/types/supabase'

export const caseStatusEnum = ['open', 'in_progress', 'resolved'] as const
export type CaseStatus = (typeof caseStatusEnum)[number]

export const casePriorityEnum = ['low', 'medium', 'high', 'urgent'] as const
export type CasePriority = (typeof casePriorityEnum)[number]

export const caseCategoryEnum = ['general', 'followup', 'prescription', 'test_results', 'emergency'] as const
export type CaseCategory = (typeof caseCategoryEnum)[number]

export const departmentEnum = ['primary_care', 'specialty_care', 'emergency', 'surgery', 'mental_health', 'admin'] as const
export type Department = (typeof departmentEnum)[number]

export const staffSpecialtyEnum = [
  'general_practice',
  'pediatrics',
  'cardiology',
  'neurology',
  'orthopedics',
  'dermatology',
  'psychiatry',
  'oncology'
] as const
export type StaffSpecialty = (typeof staffSpecialtyEnum)[number]

// Schema for creating a new case
export const createCaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(1, 'Description is required').max(10000),
  priority: z.enum(casePriorityEnum).optional(),
  category: z.enum(caseCategoryEnum).optional(),
  department: z.enum(departmentEnum).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  attachments: z.array(z.string()).optional(),
})

export type CreateCaseInput = z.infer<typeof createCaseSchema>

// Full case type from database
export type CaseResponse = Database['public']['Tables']['cases']['Row'] & {
  patient: {
    first_name: string | null
    last_name: string | null
  } | null
}

// Schema for updating a case
export const updateCaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100).optional(),
  description: z.string().min(1, 'Description is required').max(1000).optional(),
  status: z.enum(caseStatusEnum).optional(),
  priority: z.enum(casePriorityEnum).optional(),
  category: z.enum(caseCategoryEnum).optional(),
  department: z.enum(departmentEnum).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  internal_notes: z.string().max(2000).nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
})

export type UpdateCaseInput = z.infer<typeof updateCaseSchema>

// Schema for updating a case's status
export const updateCaseStatusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved'], {
    required_error: 'Status is required',
    invalid_type_error: 'Status must be one of: open, in_progress, resolved',
  }),
})

// Schema for updating internal notes (staff/admin only)
export const updateCaseInternalNotesSchema = z.object({
  internal_notes: z.string().max(2000).nullable(),
})

// Schema for updating case metadata
export const updateCaseMetadataSchema = z.object({
  metadata: z.record(z.string(), z.any()),
})

// Schema for updating case department (admin only)
export const updateCaseDepartmentSchema = z.object({
  department: z.enum(departmentEnum),
})

// Schema for assigning a case
export const assignCaseSchema = z.object({
  assigned_to: z.string().uuid().nullable(),
})

export type AssignCaseInput = z.infer<typeof assignCaseSchema>

// Schema for case query parameters
export const caseQuerySchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  status: z.enum(caseStatusEnum).optional(),
  priority: z.enum(casePriorityEnum).optional(),
  category: z.enum(caseCategoryEnum).optional(),
  department: z.enum(departmentEnum).optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  search: z.string().optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'priority']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  date_range: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional()
  }).optional()
})

export type CaseQueryParams = z.infer<typeof caseQuerySchema>

// Schema for paginated case response
export interface PaginatedCaseResponse {
  cases: CaseResponse[]
  total: number
  hasMore: boolean
  nextOffset?: number
} 