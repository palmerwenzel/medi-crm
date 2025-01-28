import { z } from 'zod'
import type { MessageMetadata } from '@/types/domain/chat'
import type { UserId } from '@/types/domain/users'

// Base metadata schema (without UI status)
const baseMetadataSchema = z.object({})

// AI processing metadata
export const aiProcessingMetadataSchema = baseMetadataSchema.extend({
  type: z.literal('ai_processing'),
  confidence_score: z.number().optional(),
  collected_info: z.object({
    chief_complaint: z.string().optional(),
    duration: z.string().optional(),
    severity: z.string().optional(),
    existing_provider: z.string().optional(),
    urgency_indicators: z.array(z.string()),
    key_symptoms: z.array(z.string()).optional(),
    recommended_specialties: z.array(z.string()).optional()
  }).optional()
}).strict()

// Handoff metadata
export const handoffMetadataSchema = baseMetadataSchema.extend({
  type: z.literal('handoff'),
  handoff_status: z.enum(['pending', 'completed', 'rejected']),
  provider_id: z.string() as unknown as z.ZodType<UserId>,
  triage_decision: z.enum(['EMERGENCY', 'URGENT', 'NON_URGENT', 'SELF_CARE'])
}).strict()

// Standard metadata
export const standardMetadataSchema = baseMetadataSchema.extend({
  type: z.literal('standard')
})

// Combined metadata schema
export const messageMetadataSchema = z.discriminatedUnion('type', [
  standardMetadataSchema,
  aiProcessingMetadataSchema,
  handoffMetadataSchema
]) satisfies z.ZodType<MessageMetadata>

export type MessageMetadataValidation = z.infer<typeof messageMetadataSchema> 