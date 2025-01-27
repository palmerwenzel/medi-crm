import { z } from 'zod'
// import { webhookEventEnum } from '@/lib/validations/shared-enums' // example

export const webhooksRowSchema = z.object({
  created_at: z.string(),
  created_by: z.string(),
  description: z.string().nullable(),
  events: z.array(z.string()), // or z.array(webhookEventEnum) if an enum
  failure_count: z.number(),
  id: z.string(),
  is_active: z.boolean(),
  last_triggered_at: z.string().nullable(),
  secret: z.string(),
  updated_at: z.string(),
  url: z.string(),
})

export type WebhooksRow = z.infer<typeof webhooksRowSchema>

export const webhooksInsertSchema = z.object({
  created_at: z.string().optional(),
  created_by: z.string(),
  description: z.string().nullable().optional(),
  events: z.array(z.string()), // or z.array(webhookEventEnum)
  failure_count: z.number().optional(),
  id: z.string().optional(),
  is_active: z.boolean().optional(),
  last_triggered_at: z.string().nullable().optional(),
  secret: z.string(),
  updated_at: z.string().optional(),
  url: z.string(),
})

export type WebhooksInsert = z.infer<typeof webhooksInsertSchema>

export const webhooksUpdateSchema = webhooksInsertSchema.partial()
export type WebhooksUpdate = z.infer<typeof webhooksUpdateSchema>