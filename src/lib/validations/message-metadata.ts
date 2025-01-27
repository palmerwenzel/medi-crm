import { z } from 'zod'
import type { MessageMetadata } from '@/types/domain/chat'
import { userIdSchema } from './shared-schemas'

// Base metadata schema (without UI status)
const baseMetadataSchema = z.object({})

// AI processing metadata
export const aiProcessingMetadataSchema = baseMetadataSchema.extend({
  type: z.literal('ai_processing'),
  confidenceScore: z.number().optional(),
  collectedInfo: z.object({
    chiefComplaint: z.string().optional(),
    duration: z.string().optional(),
    severity: z.string().optional(),
    existingProvider: z.string().optional(),
    urgencyIndicators: z.array(z.string())
  }).optional()
})

// Handoff metadata
export const handoffMetadataSchema = baseMetadataSchema.extend({
  type: z.literal('handoff'),
  handoffStatus: z.enum(['pending', 'completed', 'rejected']),
  providerId: userIdSchema,
  triageDecision: z.enum([
    'EMERGENCY',
    'URGENT',
    'NON_URGENT',
    'SELF_CARE'
  ])
})

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