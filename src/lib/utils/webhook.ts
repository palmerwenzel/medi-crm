import { createHmac } from 'crypto'
import { WebhookPayload } from '@/lib/validations/webhook'

const WEBHOOK_SIGNATURE_HEADER = 'x-medicrm-signature'
const WEBHOOK_TIMESTAMP_HEADER = 'x-medicrm-timestamp'
const MAX_TIMESTAMP_DIFF = 300 // 5 minutes in seconds

/**
 * Gets the current timestamp in seconds
 * Can be overridden in tests
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000)
}

/**
 * Generates a signature for the webhook payload
 */
export function generateWebhookSignature(
  payload: WebhookPayload,
  secret: string,
  timestamp: string
): string {
  const signaturePayload = `${timestamp}.${JSON.stringify(payload)}`
  const hmac = createHmac('sha256', secret)
  return hmac.update(signaturePayload).digest('hex')
}

/**
 * Verifies the webhook signature
 */
export function verifyWebhookSignature(
  payload: WebhookPayload,
  signature: string,
  secret: string,
  timestamp: string,
  currentTime = getCurrentTimestamp()
): boolean {
  // Check if timestamp is within acceptable range
  const timestampNum = parseInt(timestamp, 10)
  if (Math.abs(currentTime - timestampNum) > MAX_TIMESTAMP_DIFF) {
    return false
  }

  // Generate and compare signatures
  const expectedSignature = generateWebhookSignature(payload, secret, timestamp)
  return expectedSignature === signature
}

/**
 * Prepares headers for webhook delivery
 */
export function prepareWebhookHeaders(
  payload: WebhookPayload,
  secret: string
): Record<string, string> {
  const timestamp = getCurrentTimestamp().toString()
  const signature = generateWebhookSignature(payload, secret, timestamp)

  return {
    'Content-Type': 'application/json',
    [WEBHOOK_SIGNATURE_HEADER]: signature,
    [WEBHOOK_TIMESTAMP_HEADER]: timestamp,
  }
}

/**
 * Delivers webhook payload to the specified URL
 */
export async function deliverWebhook(
  url: string,
  payload: WebhookPayload,
  secret: string,
  retries = 3
): Promise<Response> {
  const headers = prepareWebhookHeaders(payload, secret)
  
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })
      
      // Consider any 2xx status code as success
      if (response.ok) {
        return response
      }
      
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`)
    } catch (error) {
      lastError = error as Error
      
      // Wait before retrying (exponential backoff)
      if (attempt < retries - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        )
      }
    }
  }
  
  throw lastError || new Error('Failed to deliver webhook')
}

/**
 * Rate limits webhook deliveries using a simple in-memory store
 * Note: For production, use Redis or similar for distributed rate limiting
 */
const rateLimits = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60 // 60 requests per minute

/**
 * Resets all rate limits (for testing)
 */
export function resetRateLimits(): void {
  rateLimits.clear()
}

export function isRateLimited(url: string, now = Date.now()): boolean {
  const limit = rateLimits.get(url)
  
  // Clean up expired entries
  if (limit && limit.resetAt < now) {
    rateLimits.delete(url)
    return false
  }
  
  if (!limit) {
    rateLimits.set(url, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    })
    return false
  }
  
  if (limit.count >= MAX_REQUESTS_PER_WINDOW) {
    return true
  }
  
  limit.count++
  return false
} 