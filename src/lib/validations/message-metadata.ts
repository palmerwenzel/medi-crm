import { z } from 'zod'
import type { 
  MessageMetadata,
  CollectedMedicalInfo,
  HandoffStatus,
  TriageDecision
} from '@/types/domain/chat'
import type { UserId } from '@/types/domain/users'

// Base metadata schema (without UI status)
const baseMetadataSchema = z.object({
  case_id: z.string().optional(),
  assessment_id: z.string().optional(),
  is_case_creation: z.boolean().optional(),
  is_assessment_creation: z.boolean().optional(),
  is_assessment_update: z.boolean().optional(),
  is_case_update: z.boolean().optional(),
  is_error: z.boolean().optional(),
  error_message: z.string().optional(),
  is_final: z.boolean().optional(),
  key_symptoms: z.array(z.string()).optional(),
  recommended_specialties: z.array(z.string()).optional(),
  urgency_indicators: z.array(z.string()).optional(),
  notes: z.string().nullable().optional()
}) satisfies z.ZodType<Partial<MessageMetadata>>

// Collected medical info schema
const collectedInfoSchema = z.object({
  chief_complaint: z.string().optional(),
  duration: z.string().optional(),
  severity: z.string().optional()
}) satisfies z.ZodType<CollectedMedicalInfo>

// AI processing metadata
export const aiProcessingMetadataSchema = baseMetadataSchema.extend({
  type: z.literal('ai_processing'),
  collected_info: collectedInfoSchema.optional(),
  triage_decision: z.custom<TriageDecision>().optional()
}).strict()

// Handoff metadata
export const handoffMetadataSchema = baseMetadataSchema.extend({
  type: z.literal('handoff'),
  handoff_status: z.custom<HandoffStatus>(),
  provider_id: z.custom<UserId>(),
  triage_decision: z.custom<TriageDecision>()
}).strict()

// Standard metadata
export const standardMetadataSchema = baseMetadataSchema.extend({
  type: z.literal('standard')
}).strict()

// Combined metadata schema
export const messageMetadataSchema = z.discriminatedUnion('type', [
  aiProcessingMetadataSchema,
  handoffMetadataSchema,
  standardMetadataSchema
]) satisfies z.ZodType<MessageMetadata>

// Type guard to ensure runtime type safety
export function validateMessageMetadata(data: unknown): MessageMetadata {
  return messageMetadataSchema.parse(data)
} 