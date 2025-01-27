import '@testing-library/jest-dom'
import {
  generateWebhookSignature,
  verifyWebhookSignature,
  prepareWebhookHeaders,
  deliverWebhook,
  isRateLimited,
  resetRateLimits
} from '../webhook'
import { WebhookPayload } from '@/lib/validations/webhooks'

// Mock getCurrentTimestamp for consistent testing
const mockCurrentTime = 1706011200 // 2024-01-23T12:00:00Z
jest.spyOn(global.Date, 'now').mockImplementation(() => mockCurrentTime * 1000)

describe('webhook utilities', () => {
  const mockPayload: WebhookPayload = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    event: 'case.created',
    timestamp: '2024-01-23T12:00:00Z',
    data: { case_id: '123', title: 'Test Case' }
  }
  const mockSecret = 'test-secret-key-32-chars-exactly!!'
  const mockTimestamp = mockCurrentTime.toString()

  beforeEach(() => {
    jest.clearAllMocks()
    resetRateLimits()
  })

  describe('generateWebhookSignature', () => {
    it('generates consistent signatures', () => {
      const signature1 = generateWebhookSignature(mockPayload, mockSecret, mockTimestamp)
      const signature2 = generateWebhookSignature(mockPayload, mockSecret, mockTimestamp)
      expect(signature1).toBe(signature2)
    })

    it('generates different signatures for different payloads', () => {
      const signature1 = generateWebhookSignature(mockPayload, mockSecret, mockTimestamp)
      const signature2 = generateWebhookSignature(
        { ...mockPayload, data: { ...mockPayload.data, title: 'Different' } },
        mockSecret,
        mockTimestamp
      )
      expect(signature1).not.toBe(signature2)
    })
  })

  describe('verifyWebhookSignature', () => {
    it('verifies valid signatures', () => {
      const signature = generateWebhookSignature(mockPayload, mockSecret, mockTimestamp)
      const isValid = verifyWebhookSignature(mockPayload, signature, mockSecret, mockTimestamp, mockCurrentTime)
      expect(isValid).toBe(true)
    })

    it('rejects invalid signatures', () => {
      const signature = 'invalid-signature'
      const isValid = verifyWebhookSignature(mockPayload, signature, mockSecret, mockTimestamp, mockCurrentTime)
      expect(isValid).toBe(false)
    })

    it('rejects expired timestamps', () => {
      const oldTimestamp = (mockCurrentTime - 301).toString() // Just over 5 minutes ago
      const signature = generateWebhookSignature(mockPayload, mockSecret, oldTimestamp)
      const isValid = verifyWebhookSignature(mockPayload, signature, mockSecret, oldTimestamp, mockCurrentTime)
      expect(isValid).toBe(false)
    })
  })

  describe('prepareWebhookHeaders', () => {
    it('includes required headers', () => {
      const headers = prepareWebhookHeaders(mockPayload, mockSecret)
      expect(headers).toHaveProperty('Content-Type', 'application/json')
      expect(headers).toHaveProperty('x-medicrm-signature')
      expect(headers).toHaveProperty('x-medicrm-timestamp')
    })
  })

  describe('deliverWebhook', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      global.fetch = jest.fn()
    })

    it('delivers webhook successfully', async () => {
      const mockResponse = { ok: true, status: 200, statusText: 'OK' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)

      const response = await deliverWebhook('https://example.com', mockPayload, mockSecret)
      expect(response).toBe(mockResponse)
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('retries on failure', async () => {
      const mockError = new Error('Network error')
      ;(global.fetch as jest.Mock)
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce({ ok: true, status: 200 })

      const response = await deliverWebhook('https://example.com', mockPayload, mockSecret)
      expect(response.ok).toBe(true)
      expect(global.fetch).toHaveBeenCalledTimes(3)
    })

    it('throws after max retries', async () => {
      const mockError = new Error('Network error')
      ;(global.fetch as jest.Mock).mockRejectedValue(mockError)

      await expect(
        deliverWebhook('https://example.com', mockPayload, mockSecret)
      ).rejects.toThrow()
      expect(global.fetch).toHaveBeenCalledTimes(3)
    })
  })

  describe('isRateLimited', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      resetRateLimits()
    })

    it('allows requests within limit', () => {
      const url = 'https://example.com'
      const now = Date.now()
      
      for (let i = 0; i < 60; i++) {
        expect(isRateLimited(url, now)).toBe(false)
      }
      expect(isRateLimited(url, now)).toBe(true)
    })

    it('resets after window expires', () => {
      const url = 'https://example.com'
      const now = Date.now()
      
      expect(isRateLimited(url, now)).toBe(false)
      expect(isRateLimited(url, now + 60 * 1000)).toBe(false) // After window expires
    })
  })
}) 