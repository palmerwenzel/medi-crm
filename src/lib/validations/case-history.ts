import { z } from 'zod'
import type { CaseHistory } from '@/types/domain/cases'
import { caseActivityTypeEnum } from '@/lib/validations/shared-enums'
import { jsonSchema } from '@/lib/validations/shared-schemas'

// Row schema and type
export const caseHistoryRowSchema = z.object({
  id: z.string(),
  activity_type: caseActivityTypeEnum,
  actor_id: z.string(),
  case_id: z.string(),
  created_at: z.string(),
  metadata: jsonSchema.nullable(),
  new_value: jsonSchema.nullable(),
  old_value: jsonSchema.nullable(),
}) satisfies z.ZodType<CaseHistory>

export type CaseHistoryRow = z.infer<typeof caseHistoryRowSchema>

// Insert schema
export const caseHistoryInsertSchema = z.object({
  activity_type: caseActivityTypeEnum,
  actor_id: z.string(),
  case_id: z.string(),
  created_at: z.string().optional(),
  id: z.string().optional(),
  metadata: jsonSchema.nullable().optional(),
  new_value: jsonSchema.nullable().optional(),
  old_value: jsonSchema.nullable().optional(),
})

// Update schema
export const caseHistoryUpdateSchema = caseHistoryInsertSchema.partial()

// Query params schema for fetching case history
export const caseHistoryQueryParamsSchema = z.object({
  case_id: z.string(),
  activity_type: caseActivityTypeEnum.optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  offset: z.number().int().nonnegative().default(0),
  limit: z.number().int().positive().max(100).default(50),
  sort_order: z.enum(['asc', 'desc']).default('desc')
})

export type CaseHistoryQueryParams = z.infer<typeof caseHistoryQueryParamsSchema>

// Response type for paginated case history
export interface PaginatedCaseHistoryResponse {
  history: CaseHistoryRow[]
  total: number
  hasMore: boolean
  nextOffset?: number
}