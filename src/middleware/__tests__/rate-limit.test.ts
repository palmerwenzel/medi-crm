import { NextRequest } from 'next/server'
import { rateLimitMiddleware } from '../rate-limit'
import { RATE_LIMITS } from '@/lib/utils/rate-limit'

// Helper to create a mock request
function createMockRequest(path: string, ip: string = '127.0.0.1', userId?: string): NextRequest {
  const headers = new Headers()
  if (userId) {
    headers.set('x-user-id', userId)
  }
  headers.set('x-forwarded-for', ip)

  return new NextRequest(new URL(`http://localhost${path}`), {
    headers,
  })
}

describe('rate limit middleware', () => {
  beforeEach(() => {
    // Reset rate limits before each test
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('allows requests within default limit', async () => {
    const request = createMockRequest('/api/test')
    const { max } = RATE_LIMITS.DEFAULT

    // Make requests up to the limit
    for (let i = 0; i < max; i++) {
      const response = await rateLimitMiddleware(request)
      expect(response.status).not.toBe(429)
      
      const remaining = response.headers.get('X-RateLimit-Remaining')
      expect(remaining).toBe((max - (i + 1)).toString())
    }

    // Next request should be limited
    const response = await rateLimitMiddleware(request)
    expect(response.status).toBe(429)
  })

  it('applies stricter limits for auth routes', async () => {
    const request = createMockRequest('/api/auth/login')
    const { max } = RATE_LIMITS.AUTH

    // Make requests up to the limit
    for (let i = 0; i < max; i++) {
      const response = await rateLimitMiddleware(request)
      expect(response.status).not.toBe(429)
    }

    // Next request should be limited
    const response = await rateLimitMiddleware(request)
    expect(response.status).toBe(429)
  })

  it('applies upload limits correctly', async () => {
    const request = createMockRequest('/api/upload')
    const { max } = RATE_LIMITS.FILE_UPLOAD

    // Make requests up to the limit
    for (let i = 0; i < max; i++) {
      const response = await rateLimitMiddleware(request)
      expect(response.status).not.toBe(429)
    }

    // Next request should be limited
    const response = await rateLimitMiddleware(request)
    expect(response.status).toBe(429)
  })

  it('tracks limits separately by IP', async () => {
    const request1 = createMockRequest('/api/test', '1.1.1.1')
    const request2 = createMockRequest('/api/test', '2.2.2.2')

    // Use up first IP's limit
    for (let i = 0; i < RATE_LIMITS.DEFAULT.max; i++) {
      await rateLimitMiddleware(request1)
    }
    const response1 = await rateLimitMiddleware(request1)
    expect(response1.status).toBe(429)

    // Second IP should still be allowed
    const response2 = await rateLimitMiddleware(request2)
    expect(response2.status).not.toBe(429)
  })

  it('tracks limits separately by user ID', async () => {
    const request1 = createMockRequest('/api/test', '1.1.1.1', 'user1')
    const request2 = createMockRequest('/api/test', '1.1.1.1', 'user2')

    // Use up first user's limit
    for (let i = 0; i < RATE_LIMITS.DEFAULT.max; i++) {
      await rateLimitMiddleware(request1)
    }
    const response1 = await rateLimitMiddleware(request1)
    expect(response1.status).toBe(429)

    // Second user should still be allowed
    const response2 = await rateLimitMiddleware(request2)
    expect(response2.status).not.toBe(429)
  })

  it('includes correct headers in responses', async () => {
    const request = createMockRequest('/api/test')
    const response = await rateLimitMiddleware(request)

    expect(response.headers.has('X-RateLimit-Limit')).toBe(true)
    expect(response.headers.has('X-RateLimit-Remaining')).toBe(true)
    expect(response.headers.has('X-RateLimit-Reset')).toBe(true)
  })

  it('includes error details in 429 response', async () => {
    const request = createMockRequest('/api/test')

    // Use up the limit
    for (let i = 0; i < RATE_LIMITS.DEFAULT.max; i++) {
      await rateLimitMiddleware(request)
    }

    const response = await rateLimitMiddleware(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data).toEqual({
      error: 'Too many requests',
      message: 'Please try again later',
    })
  })

  it('ignores non-API routes', async () => {
    const request = createMockRequest('/about')
    const response = await rateLimitMiddleware(request)

    expect(response.status).not.toBe(429)
    expect(response.headers.has('X-RateLimit-Limit')).toBe(false)
  })
}) 