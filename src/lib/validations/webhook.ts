import { z } from 'zod'

// Available webhook event types
export const WebhookEventType = {
  CASE_CREATED: 'case.created',
  CASE_UPDATED: 'case.updated',
  CASE_STATUS_CHANGED: 'case.status_changed',
  CASE_ASSIGNED: 'case.assigned',
  CASE_DELETED: 'case.deleted',
} as const

export type WebhookEventType = typeof WebhookEventType[keyof typeof WebhookEventType]

// Schema for webhook registration
export const webhookSchema = z.object({
  url: z.string().url().startsWith('https'),
  secret: z.string().min(32).max(256),
  description: z.string().optional(),
  events: z.array(z.enum([
    WebhookEventType.CASE_CREATED,
    WebhookEventType.CASE_UPDATED,
    WebhookEventType.CASE_STATUS_CHANGED,
    WebhookEventType.CASE_ASSIGNED,
    WebhookEventType.CASE_DELETED,
  ])).min(1),
})

export type WebhookRegistration = z.infer<typeof webhookSchema>

// Schema for webhook payload
export const webhookPayloadSchema = z.object({
  id: z.string().uuid(),
  event: z.enum([
    WebhookEventType.CASE_CREATED,
    WebhookEventType.CASE_UPDATED,
    WebhookEventType.CASE_STATUS_CHANGED,
    WebhookEventType.CASE_ASSIGNED,
    WebhookEventType.CASE_DELETED,
  ]),
  timestamp: z.string().datetime(),
  data: z.record(z.unknown()),
})

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>

// Schema for webhook delivery response
export const webhookDeliveryResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string().optional(),
  timestamp: z.string().datetime(),
})

export type WebhookDeliveryResponse = z.infer<typeof webhookDeliveryResponseSchema>

// Schema for webhook test payload
export const webhookTestPayloadSchema = z.object({
  event: z.enum([
    WebhookEventType.CASE_CREATED,
    WebhookEventType.CASE_UPDATED,
    WebhookEventType.CASE_STATUS_CHANGED,
    WebhookEventType.CASE_ASSIGNED,
    WebhookEventType.CASE_DELETED,
  ]),
  data: z.record(z.unknown()).optional(),
})

export type WebhookTestPayload = z.infer<typeof webhookTestPayloadSchema> 