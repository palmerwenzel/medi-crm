// Domain-specific webhook types
export interface WebhookPayload {
  event: string
  timestamp: string
  data: Record<string, unknown>
  metadata?: Record<string, unknown>
} 