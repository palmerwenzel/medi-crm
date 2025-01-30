import { z } from 'zod'
import type { WebhookPayload } from '@/types/domain/webhooks'
import type { DbWebhook, DbWebhookInsert, DbWebhookUpdate } from '@/types/domain/db'
// import { webhookEventEnum } from '@/lib/validations/shared-enums' // example

// Base database schema
const dbWebhookSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  created_by: z.string(),
  description: z.string().nullable(),
  events: z.array(z.string()),
  failure_count: z.number(),
  is_active: z.boolean(),
  last_triggered_at: z.string().nullable(),
  secret: z.string(),
  updated_at: z.string(),
  url: z.string()
}) satisfies z.ZodType<DbWebhook>

// Transform to domain type (if needed in the future)
export const webhooksRowSchema = dbWebhookSchema

export type WebhooksRow = z.infer<typeof webhooksRowSchema>

// Insert schema (for domain -> database)
export const webhooksInsertSchema = z.object({
  created_by: z.string(),
  events: z.array(z.string()),
  secret: z.string(),
  url: z.string()
}).extend({
  description: z.string().nullable().optional(),
  failure_count: z.number().optional(),
  id: z.string().optional(),
  is_active: z.boolean().optional(),
  last_triggered_at: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
}) satisfies z.ZodType<DbWebhookInsert>

export type WebhooksInsert = z.infer<typeof webhooksInsertSchema>

// Update schema
export const webhooksUpdateSchema = webhooksInsertSchema.partial() satisfies z.ZodType<DbWebhookUpdate>
export type WebhooksUpdate = z.infer<typeof webhooksUpdateSchema>

// Webhook payload schema
export const webhookPayloadSchema = z.object({
  event: z.string(),
  timestamp: z.string(),
  data: z.record(z.unknown()),
  metadata: z.record(z.unknown()).optional()
}) satisfies z.ZodType<WebhookPayload>

// Re-export types
export type { WebhookPayload } from '@/types/domain/webhooks'