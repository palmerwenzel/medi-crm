import * as z from 'zod'

// Schema for creating a new case
export const createCaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
})

// Schema for updating a case's status
export const updateCaseStatusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved'], {
    required_error: 'Status is required',
    invalid_type_error: 'Status must be one of: open, in_progress, resolved',
  }),
})

// Schema for updating a case
export const updateCaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters').optional(),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters').optional(),
  status: z.enum(['open', 'in_progress', 'resolved'], {
    invalid_type_error: 'Status must be one of: open, in_progress, resolved',
  }).optional(),
})

// Types
export type CreateCaseInput = z.infer<typeof createCaseSchema>
export type UpdateCaseStatusInput = z.infer<typeof updateCaseStatusSchema>
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>

// Response type for a single case
export type CaseResponse = {
  id: string
  patient_id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved'
  created_at: string
  updated_at: string
} 