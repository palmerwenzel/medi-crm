import '@testing-library/jest-dom'
import { checkRateLimit, cleanupRateLimits, RATE_LIMITS } from '../rate-limit'

describe('rate limiting utilities', () => {
  beforeEach(() => {
    // Reset rate limits before each test
    cleanupRateLimits()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('checkRateLimit', () => {
    it('allows requests within limit', () => {
      const identifier = 'test-user'
      const route = '/api/test'
      const config = { windowMs: 1000, max: 3 }

      // Make 3 requests (within limit)
      for (let i = 0; i < 3; i++) {
        const result = checkRateLimit(identifier, route, config)
        expect(result.isLimited).toBe(false)
        expect(result.remaining).toBe(config.max - (i + 1))
      }

      // Fourth request should be limited
      const result = checkRateLimit(identifier, route, config)
      expect(result.isLimited).toBe(true)
      expect(result.remaining).toBe(0)
    })

    it('resets limit after window expires', () => {
      const identifier = 'test-user'
      const route = '/api/test'
      const config = { windowMs: 1000, max: 2 }

      // Use up the limit
      checkRateLimit(identifier, route, config)
      checkRateLimit(identifier, route, config)
      expect(checkRateLimit(identifier, route, config).isLimited).toBe(true)

      // Advance time past window
      jest.advanceTimersByTime(config.windowMs)

      // Should be allowed again
      const result = checkRateLimit(identifier, route, config)
      expect(result.isLimited).toBe(false)
      expect(result.remaining).toBe(config.max - 1)
    })

    it('tracks limits separately for different identifiers', () => {
      const route = '/api/test'
      const config = { windowMs: 1000, max: 2 }

      // First user uses up their limit
      checkRateLimit('user1', route, config)
      checkRateLimit('user1', route, config)
      expect(checkRateLimit('user1', route, config).isLimited).toBe(true)

      // Second user should still be allowed
      const result = checkRateLimit('user2', route, config)
      expect(result.isLimited).toBe(false)
      expect(result.remaining).toBe(config.max - 1)
    })

    it('tracks limits separately for different routes', () => {
      const identifier = 'test-user'
      const config = { windowMs: 1000, max: 2 }

      // Use up limit for first route
      checkRateLimit(identifier, '/api/route1', config)
      checkRateLimit(identifier, '/api/route1', config)
      expect(checkRateLimit(identifier, '/api/route1', config).isLimited).toBe(true)

      // Second route should still be allowed
      const result = checkRateLimit(identifier, '/api/route2', config)
      expect(result.isLimited).toBe(false)
      expect(result.remaining).toBe(config.max - 1)
    })
  })

  describe('cleanupRateLimits', () => {
    it('removes expired limits', () => {
      const identifier = 'test-user'
      const route = '/api/test'
      const config = { windowMs: 1000, max: 2 }

      // Create some rate limits
      checkRateLimit(identifier, route, config)

      // Advance time past window
      jest.advanceTimersByTime(config.windowMs)

      // Clean up
      cleanupRateLimits()

      // Should be allowed to make max requests again
      for (let i = 0; i < config.max; i++) {
        const result = checkRateLimit(identifier, route, config)
        expect(result.isLimited).toBe(false)
      }
    })
  })

  describe('RATE_LIMITS configurations', () => {
    it('applies DEFAULT limit correctly', () => {
      const identifier = 'test-user'
      const route = '/api/test'
      const { max } = RATE_LIMITS.DEFAULT

      // Should allow max requests
      for (let i = 0; i < max; i++) {
        const result = checkRateLimit(identifier, route)
        expect(result.isLimited).toBe(false)
      }

      // Next request should be limited
      expect(checkRateLimit(identifier, route).isLimited).toBe(true)
    })

    it('applies AUTH limit correctly', () => {
      const identifier = 'test-user'
      const route = '/api/auth'
      const { max } = RATE_LIMITS.AUTH

      // Should allow max requests
      for (let i = 0; i < max; i++) {
        const result = checkRateLimit(identifier, route, RATE_LIMITS.AUTH)
        expect(result.isLimited).toBe(false)
      }

      // Next request should be limited
      expect(checkRateLimit(identifier, route, RATE_LIMITS.AUTH).isLimited).toBe(true)
    })

    it('applies FILE_UPLOAD limit correctly', () => {
      const identifier = 'test-user'
      const route = '/api/upload'
      const { max } = RATE_LIMITS.FILE_UPLOAD

      // Should allow max requests
      for (let i = 0; i < max; i++) {
        const result = checkRateLimit(identifier, route, RATE_LIMITS.FILE_UPLOAD)
        expect(result.isLimited).toBe(false)
      }

      // Next request should be limited
      expect(checkRateLimit(identifier, route, RATE_LIMITS.FILE_UPLOAD).isLimited).toBe(true)
    })
  })
}) 