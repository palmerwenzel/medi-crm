/**
 * Case history validation schemas and types
 * Uses Zod for runtime validation
 */

import * as z from 'zod'
import type { Database } from '@/types/supabase'

// Activity types enum
export const caseActivityTypeEnum = [
  'status_change',
  'priority_change',
  'category_change',
  'department_change',
  'assignment_change',
  'note_added',
  'file_added',
  'file_removed',
  'metadata_change'
] as const
export type CaseActivityType = (typeof caseActivityTypeEnum)[number]

// Base case history type from database
export type CaseHistoryRow = Database['public']['Tables']['case_history']['Row']

// Extended case history type with actor details
export type CaseHistoryResponse = CaseHistoryRow & {
  actor: {
    id: string
    first_name: string | null
    last_name: string | null
    role: string
  }
}

// Schema for querying case history
export const caseHistoryQuerySchema = z.object({
  case_id: z.string().uuid(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  activity_type: z.enum(caseActivityTypeEnum).optional(),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc')
})

export type CaseHistoryQueryParams = z.infer<typeof caseHistoryQuerySchema>

// Schema for paginated history response
export interface PaginatedCaseHistoryResponse {
  history: CaseHistoryResponse[]
  total: number
  hasMore: boolean
  nextOffset?: number
} 