/**
 * Case validation schemas and types
 * Uses Zod for runtime validation
 */

import { z } from 'zod'

// Enums
export const caseStatusEnum = ['open', 'in_progress', 'resolved'] as const
export const casePriorityEnum = ['low', 'medium', 'high', 'urgent'] as const
export const caseCategoryEnum = ['general', 'followup', 'prescription', 'test_results', 'emergency'] as const
export const caseDepartmentEnum = ['admin', 'emergency', 'primary_care', 'specialty_care', 'surgery', 'mental_health'] as const
export const staffSpecialtyEnum = ['general_practice', 'pediatrics', 'cardiology', 'neurology', 'orthopedics', 'dermatology', 'psychiatry', 'oncology'] as const
export const caseSortFieldEnum = ['priority', 'created_at', 'updated_at', 'sla_breach'] as const

// Types
export type CaseStatus = typeof caseStatusEnum[number]
export type CasePriority = typeof casePriorityEnum[number]
export type CaseCategory = typeof caseCategoryEnum[number]
export type CaseDepartment = typeof caseDepartmentEnum[number]
export type StaffSpecialty = typeof staffSpecialtyEnum[number]
export type CaseSortField = typeof caseSortFieldEnum[number]

/**
 * SLA tier configuration for case prioritization
 * @see defaultSLAConfigs for tier-specific time limits
 */
export const slaTierEnum = ['standard', 'priority', 'urgent'] as const
export type SLATier = (typeof slaTierEnum)[number]

/**
 * Configuration for Service Level Agreement timing
 * @property tier - The SLA tier level
 * @property responseTime - Target time for first response in minutes
 * @property resolutionTime - Target time for case resolution in minutes
 */
export interface SLAConfig {
  tier: SLATier
  responseTime: number
  resolutionTime: number
}

/**
 * Default SLA configurations by case priority
 * Maps each priority level to its corresponding SLA requirements
 */
export const defaultSLAConfigs: Readonly<Record<CasePriority, SLAConfig>> = {
  low: { tier: 'standard', responseTime: 24 * 60, resolutionTime: 72 * 60 },
  medium: { tier: 'standard', responseTime: 12 * 60, resolutionTime: 48 * 60 },
  high: { tier: 'priority', responseTime: 4 * 60, resolutionTime: 24 * 60 },
  urgent: { tier: 'urgent', responseTime: 30, resolutionTime: 4 * 60 },
} as const

// SLA Metadata
export const slaMetadataSchema = z.object({
  response_target: z.string().datetime(),
  resolution_target: z.string().datetime(),
  last_updated: z.string().datetime(),
  first_response_at: z.string().datetime().nullable().optional(),
  sla_breached: z.boolean().optional(),
  sla_tier: z.enum(slaTierEnum).optional(),
})

export type SLAMetadata = z.infer<typeof slaMetadataSchema>

// Create a branded type for case IDs
export type CaseId = string & { readonly __brand: unique symbol }

// Case Response Schema
export const caseResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  status: z.enum(caseStatusEnum),
  priority: z.enum(casePriorityEnum),
  category: z.enum(caseCategoryEnum),
  department: z.enum(caseDepartmentEnum),
  patient_id: z.string().uuid(),
  assigned_to: z.object({
    id: z.string().uuid(),
    first_name: z.string().nullable(),
    last_name: z.string().nullable(),
    role: z.string(),
    specialty: z.enum(staffSpecialtyEnum).nullable()
  }).nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  metadata: z.object({
    sla: slaMetadataSchema.optional(),
    tags: z.array(z.string()).optional(),
    internal_notes: z.string().optional()
  }).optional(),
  patient: z.object({
    first_name: z.string().nullable(),
    last_name: z.string().nullable(),
  }).nullable(),
  attachments: z.array(z.string()).optional(),
  internal_notes: z.string().nullable()
})

// Case Response Type
export type CaseResponse = z.infer<typeof caseResponseSchema>

// Schema for creating a new case
export const createCaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(1, 'Description is required').max(10000),
  priority: z.enum(casePriorityEnum).optional(),
  category: z.enum(caseCategoryEnum).optional(),
  department: z.enum(caseDepartmentEnum),
  metadata: z.record(z.string(), z.any()).optional(),
  attachments: z.array(z.string()).optional(),
  sla: slaMetadataSchema.optional(),
})

export type CreateCaseInput = z.infer<typeof createCaseSchema>

// Schema for updating a case
export const updateCaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100).optional(),
  description: z.string().min(1, 'Description is required').max(1000).optional(),
  status: z.enum(caseStatusEnum).optional(),
  priority: z.enum(casePriorityEnum).optional(),
  category: z.enum(caseCategoryEnum).optional(),
  department: z.enum(caseDepartmentEnum).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  internal_notes: z.string().max(2000).nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
})

export type UpdateCaseInput = z.infer<typeof updateCaseSchema>

// Schema for updating a case's status
export const updateCaseStatusSchema = z.object({
  status: z.enum(caseStatusEnum, {
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
  department: z.enum(caseDepartmentEnum),
})

// Schema for assigning a case
export const assignCaseSchema = z.object({
  assigned_to: z.string().uuid().nullable(),
})

export type AssignCaseInput = z.infer<typeof assignCaseSchema>

// Schema for case query parameters
export const caseQuerySchema = z.object({
  status: z.array(z.enum(caseStatusEnum)).optional(),
  priority: z.array(z.enum(casePriorityEnum)).optional(),
  category: z.array(z.enum(caseCategoryEnum)).optional(),
  department: z.array(z.enum(caseDepartmentEnum)).optional(),
  specialty: z.enum(staffSpecialtyEnum).optional(),
  assigned_to: z.string().uuid().optional(),
  search: z.string().optional(),
  sort_by: z.enum(caseSortFieldEnum).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  date_range: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }).optional(),
  offset: z.number().int().min(0).optional(),
  limit: z.number().int().min(1).optional(),
})

export type CaseQueryParams = z.infer<typeof caseQuerySchema>

// Schema for paginated case response
export interface PaginatedCaseResponse {
  cases: CaseResponse[]
  total: number
  hasMore: boolean
  nextOffset?: number
}

// Type guard for SLA metadata
export function hasSLAMetadata(
  metadata: CaseResponse['metadata']
): metadata is NonNullable<CaseResponse['metadata']> & { sla: NonNullable<SLAMetadata> } {
  return metadata !== null && 
    metadata !== undefined && 
    metadata.sla !== undefined &&
    'response_target' in metadata.sla &&
    'resolution_target' in metadata.sla &&
    'last_updated' in metadata.sla
} 