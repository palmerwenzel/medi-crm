import { z } from 'zod'
import type { CaseNote, CaseNoteInsert, CaseNoteUpdate } from '@/types/domain/cases'

/**
 * Zod schema for case_notes Row
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
 * Zod schema for case_notes Insert
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
 * Zod schema for case_notes Update
 */
export const caseNotesUpdateSchema = caseNotesInsertSchema.partial() satisfies z.ZodType<CaseNoteUpdate>

export type CaseNotesUpdate = z.infer<typeof caseNotesUpdateSchema>