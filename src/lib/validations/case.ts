/**
 * Case validation schemas and types
 * Uses Zod for runtime validation
 */

import * as z from 'zod'
import type { Database } from '@/types/supabase'

export const caseStatusEnum = ['open', 'in_progress', 'resolved'] as const
export type CaseStatus = (typeof caseStatusEnum)[number]

// Schema for creating a new case
export const createCaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(1, 'Description is required').max(1000),
})

export type CreateCaseInput = z.infer<typeof createCaseSchema>

// Full case type from database
export type CaseResponse = Database['public']['Tables']['cases']['Row']

// Schema for updating a case
export const updateCaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100).optional(),
  description: z.string().min(1, 'Description is required').max(1000).optional(),
  status: z.enum(caseStatusEnum).optional(),
})

export type UpdateCaseInput = z.infer<typeof updateCaseSchema>

// Schema for updating a case's status
export const updateCaseStatusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved'], {
    required_error: 'Status is required',
    invalid_type_error: 'Status must be one of: open, in_progress, resolved',
  }),
})

export type UpdateCaseStatusInput = z.infer<typeof updateCaseStatusSchema> 