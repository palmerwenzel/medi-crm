import { z } from 'zod'
import type { CaseNote, CaseNoteInsert, CaseNoteUpdate } from '@/types/domain/cases'
import { userRoleEnum } from '@/lib/validations/shared-enums'

/**
 * Base schema for case notes
 */
export const caseNotesRowSchema = z.object({
  case_id: z.string(),
  content: z.string(),
  created_at: z.string(),
  id: z.string(),
  staff_id: z.string(),
  updated_at: z.string(),
}) satisfies z.ZodType<CaseNote>

export type CaseNotesRow = z.infer<typeof caseNotesRowSchema>

/**
 * Schema for staff member information
 */
const staffSchema = z.object({
  id: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  role: userRoleEnum
})

/**
 * Response schema for case notes with staff information
 */
export const caseNotesResponseSchema = caseNotesRowSchema.extend({
  staff: staffSchema
})

export type CaseNotesResponse = z.infer<typeof caseNotesResponseSchema>

/**
 * Schema for inserting case notes
 */
export const caseNotesInsertSchema = z.object({
  case_id: z.string(),
  content: z.string(),
  created_at: z.string().optional(),
  id: z.string().optional(),
  staff_id: z.string(),
  updated_at: z.string().optional(),
}) satisfies z.ZodType<CaseNoteInsert>

export type CaseNotesInsert = z.infer<typeof caseNotesInsertSchema>

/**
 * Schema for updating case notes
 */
export const caseNotesUpdateSchema = caseNotesInsertSchema.partial() satisfies z.ZodType<CaseNoteUpdate>

export type CaseNotesUpdate = z.infer<typeof caseNotesUpdateSchema>

/**
 * Query parameters for fetching case notes
 */
export const caseNotesQueryParamsSchema = z.object({
  case_id: z.string(),
  staff_id: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  offset: z.number().int().nonnegative().default(0),
  limit: z.number().int().positive().max(100).default(50),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  include_staff: z.boolean().optional()
})

export type CaseNotesQueryParams = z.infer<typeof caseNotesQueryParamsSchema>

/**
 * Response type for paginated case notes
 */
export interface PaginatedCaseNotesResponse {
  notes: CaseNotesResponse[]
  total: number
  hasMore: boolean
  nextOffset?: number
}