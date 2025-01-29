/**
 * Domain types for webhook handling and event processing.
 * Used for integrating external services and handling system events.
 */

/**
 * Standard webhook payload structure for all system events.
 * Provides a consistent format for event data and metadata.
 */
export interface WebhookPayload {
  event: string                      // Event type identifier (e.g., 'case.created', 'message.sent')
  timestamp: string                  // ISO timestamp of when the event occurred
  data: Record<string, unknown>      // Event-specific payload data
  metadata?: Record<string, unknown> // Optional additional context about the event
} 