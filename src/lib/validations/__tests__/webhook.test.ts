import '@testing-library/jest-dom'
import {
  webhookSchema,
  webhookPayloadSchema,
  webhookTestPayloadSchema,
  WebhookEventType
} from '../webhook'

describe('webhook validation schemas', () => {
  describe('webhookSchema', () => {
    it('validates valid webhook registration', () => {
      const validWebhook = {
        url: 'https://example.com/webhook',
        secret: 'a'.repeat(32),
        description: 'Test webhook',
        events: [WebhookEventType.CASE_CREATED, WebhookEventType.CASE_UPDATED]
      }

      const result = webhookSchema.safeParse(validWebhook)
      expect(result.success).toBe(true)
    })

    it('requires HTTPS URL', () => {
      const invalidWebhook = {
        url: 'http://example.com/webhook',
        secret: 'a'.repeat(32),
        events: [WebhookEventType.CASE_CREATED]
      }

      const result = webhookSchema.safeParse(invalidWebhook)
      expect(result.success).toBe(false)
    })

    it('requires minimum secret length', () => {
      const invalidWebhook = {
        url: 'https://example.com/webhook',
        secret: 'short',
        events: [WebhookEventType.CASE_CREATED]
      }

      const result = webhookSchema.safeParse(invalidWebhook)
      expect(result.success).toBe(false)
    })

    it('requires at least one event', () => {
      const invalidWebhook = {
        url: 'https://example.com/webhook',
        secret: 'a'.repeat(32),
        events: []
      }

      const result = webhookSchema.safeParse(invalidWebhook)
      expect(result.success).toBe(false)
    })
  })

  describe('webhookPayloadSchema', () => {
    it('validates valid webhook payload', () => {
      const validPayload = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        event: WebhookEventType.CASE_CREATED,
        timestamp: new Date().toISOString(),
        data: { case_id: '123', title: 'Test Case' }
      }

      const result = webhookPayloadSchema.safeParse(validPayload)
      expect(result.success).toBe(true)
    })

    it('requires valid UUID', () => {
      const invalidPayload = {
        id: 'not-a-uuid',
        event: WebhookEventType.CASE_CREATED,
        timestamp: new Date().toISOString(),
        data: {}
      }

      const result = webhookPayloadSchema.safeParse(invalidPayload)
      expect(result.success).toBe(false)
    })

    it('requires valid event type', () => {
      const invalidPayload = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        event: 'invalid.event',
        timestamp: new Date().toISOString(),
        data: {}
      }

      const result = webhookPayloadSchema.safeParse(invalidPayload)
      expect(result.success).toBe(false)
    })

    it('requires ISO timestamp', () => {
      const invalidPayload = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        event: WebhookEventType.CASE_CREATED,
        timestamp: 'invalid-date',
        data: {}
      }

      const result = webhookPayloadSchema.safeParse(invalidPayload)
      expect(result.success).toBe(false)
    })
  })

  describe('webhookTestPayloadSchema', () => {
    it('validates valid test payload', () => {
      const validPayload = {
        event: WebhookEventType.CASE_CREATED,
        data: { test: true }
      }

      const result = webhookTestPayloadSchema.safeParse(validPayload)
      expect(result.success).toBe(true)
    })

    it('allows omitting data', () => {
      const validPayload = {
        event: WebhookEventType.CASE_CREATED
      }

      const result = webhookTestPayloadSchema.safeParse(validPayload)
      expect(result.success).toBe(true)
    })

    it('requires valid event type', () => {
      const invalidPayload = {
        event: 'invalid.event'
      }

      const result = webhookTestPayloadSchema.safeParse(invalidPayload)
      expect(result.success).toBe(false)
    })
  })
}) 