/**
 * Rate limiting utility for API routes
 * Uses in-memory storage (consider Redis for production)
 */

interface RateLimitConfig {
  windowMs: number
  max: number
}

interface RateLimitInfo {
  count: number
  resetAt: number
}

// Store rate limit info in memory
const rateLimits = new Map<string, Map<string, RateLimitInfo>>()

// Default configurations for different route types
export const RATE_LIMITS = {
  DEFAULT: { windowMs: 60 * 1000, max: 60 }, // 60 requests per minute
  AUTH: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 requests per 15 minutes
  FILE_UPLOAD: { windowMs: 60 * 1000, max: 10 }, // 10 uploads per minute
  SENSITIVE: { windowMs: 60 * 1000, max: 30 }, // 30 requests per minute
} as const

/**
 * Checks if a request should be rate limited
 * @param identifier - Unique identifier (e.g., IP or user ID)
 * @param route - Route identifier for separate limits
 * @param config - Rate limit configuration
 * @returns Object containing limit info and whether request is allowed
 */
export function checkRateLimit(
  identifier: string,
  route: string,
  config: RateLimitConfig = RATE_LIMITS.DEFAULT
): { isLimited: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  
  // Get or create route limits
  if (!rateLimits.has(route)) {
    rateLimits.set(route, new Map())
  }
  const routeLimits = rateLimits.get(route)!

  // Get or create user limit info
  const userLimit = routeLimits.get(identifier)
  
  // If no existing limit or window expired, create new
  if (!userLimit || userLimit.resetAt <= now) {
    const newLimit = {
      count: 1,
      resetAt: now + config.windowMs
    }
    routeLimits.set(identifier, newLimit)
    return {
      isLimited: false,
      remaining: config.max - 1,
      resetAt: newLimit.resetAt
    }
  }

  // Check if user has exceeded limit
  if (userLimit.count >= config.max) {
    return {
      isLimited: true,
      remaining: 0,
      resetAt: userLimit.resetAt
    }
  }

  // Increment counter
  userLimit.count++
  return {
    isLimited: false,
    remaining: config.max - userLimit.count,
    resetAt: userLimit.resetAt
  }
}

/**
 * Cleans up expired rate limit entries
 * Should be called periodically
 */
export function cleanupRateLimits(): void {
  const now = Date.now()
  
  for (const [route, routeLimits] of rateLimits.entries()) {
    for (const [identifier, limit] of routeLimits.entries()) {
      if (limit.resetAt <= now) {
        routeLimits.delete(identifier)
      }
    }
    
    // Remove empty route maps
    if (routeLimits.size === 0) {
      rateLimits.delete(route)
    }
  }
}

// Clean up every minute
setInterval(cleanupRateLimits, 60 * 1000) 