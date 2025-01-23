import { NextResponse, type NextRequest } from 'next/server'
import { checkRateLimit, RATE_LIMITS } from '@/lib/utils/rate-limit'

/**
 * Gets rate limit configuration based on the request path
 */
function getRateLimitConfig(pathname: string) {
  if (pathname.startsWith('/api/auth')) {
    return RATE_LIMITS.AUTH
  }
  if (pathname.includes('upload') || pathname.includes('file')) {
    return RATE_LIMITS.FILE_UPLOAD
  }
  if (pathname.includes('webhook') || pathname.includes('settings')) {
    return RATE_LIMITS.SENSITIVE
  }
  return RATE_LIMITS.DEFAULT
}

/**
 * Gets a unique identifier for rate limiting
 * Uses IP address and optional user ID
 */
function getRateLimitIdentifier(request: NextRequest): string {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown'
  const userId = request.headers.get('x-user-id')
  return userId ? `${ip}:${userId}` : ip
}

/**
 * Middleware to apply rate limiting to API routes
 */
export async function rateLimitMiddleware(
  request: NextRequest
) {
  const { pathname } = request.nextUrl

  // Only apply to API routes
  if (!pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const identifier = getRateLimitIdentifier(request)
  const config = getRateLimitConfig(pathname)
  const { isLimited, remaining, resetAt } = checkRateLimit(identifier, pathname, config)

  // Add rate limit headers
  const headers = new Headers({
    'X-RateLimit-Limit': config.max.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': resetAt.toString(),
  })

  if (isLimited) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Please try again later',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(headers.entries()),
        },
      }
    )
  }

  const response = NextResponse.next()
  
  // Add headers to response
  headers.forEach((value, key) => {
    response.headers.set(key, value)
  })

  return response
} 