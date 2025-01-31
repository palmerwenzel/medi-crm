import { z } from 'zod'
import type { 
  CaseHistory, 
  CaseHistoryInsert, 
  CaseHistoryUpdate,
  CaseHistoryWithActor,
  CaseHistoryDetails
} from '@/types/domain/cases'
import type { Json } from '@/types/supabase'
import { 
  caseActivityTypeEnum,
  caseStatusEnum
} from '@/lib/validations/shared-enums'
import { jsonSchema } from '@/lib/validations/shared-schemas'

// Schema for case history details
const caseHistoryDetailsSchema = z.object({
  previous_status: caseStatusEnum.optional(),
  new_status: caseStatusEnum.optional(),
  previous_assigned_to: z.string().optional(),
  new_assigned_to: z.string().optional(),
  comment: z.string().optional(),
  changes: z.record(z.object({
    old: z.unknown().optional().transform(v => v ?? null),
    new: z.unknown().optional().transform(v => v ?? null)
  })).optional().transform(v => v ?? {})
})

// Base schema for case history
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

// Schema for case history with actor information
const actorSchema = z.object({
  id: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  role: z.string()
})

export const caseHistoryWithActorSchema = caseHistoryRowSchema.extend({
  actor: actorSchema
}) satisfies z.ZodType<CaseHistoryWithActor>

export type CaseHistoryWithActorRow = z.infer<typeof caseHistoryWithActorSchema>

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
}) satisfies z.ZodType<CaseHistoryInsert>

export type CaseHistoryInsertRow = z.infer<typeof caseHistoryInsertSchema>

// Update schema
export const caseHistoryUpdateSchema = caseHistoryInsertSchema.partial() satisfies z.ZodType<CaseHistoryUpdate>

export type CaseHistoryUpdateRow = z.infer<typeof caseHistoryUpdateSchema>

// Query params schema for fetching case history
export const caseHistoryQueryParamsSchema = z.object({
  case_id: z.string(),
  activity_type: caseActivityTypeEnum.optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  offset: z.number().int().nonnegative().default(0),
  limit: z.number().int().positive().max(100).default(50),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  include_actor: z.boolean().optional()
})

export type CaseHistoryQueryParams = z.infer<typeof caseHistoryQueryParamsSchema>

// Response types for paginated case history
export interface PaginatedCaseHistoryResponse {
  history: CaseHistoryWithActorRow[]
  total: number
  hasMore: boolean
  nextOffset?: number
}

// Helper function to serialize case history details to JSON
export function serializeCaseHistoryDetails(details: z.infer<typeof caseHistoryDetailsSchema>): Json {
  return details as Json
}

// Helper function to parse case history details from JSON
export function parseCaseHistoryDetails(json: Json): CaseHistoryDetails | null {
  if (!json) return null
  const result = caseHistoryDetailsSchema.safeParse(json)
  return result.success ? result.data as CaseHistoryDetails : null
}