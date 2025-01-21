import { NextResponse } from 'next/server'
import { GET, POST } from '../route'
import { GET as GET_SINGLE, PATCH } from '../[id]/route'
import { createApiClient } from '@/lib/supabase/api'

// Mock dependencies
jest.mock('@/lib/supabase/api')

// Mock types
const mockSession = {
  user: { id: 'test-user-id' }
}

const mockCase = {
  id: 'test-case-id',
  patient_id: 'test-user-id',
  title: 'Test Case',
  description: 'Test Description',
  status: 'open',
  created_at: '2024-01-21T00:00:00Z',
  updated_at: '2024-01-21T00:00:00Z'
}

describe('Cases API Routes', () => {
  let mockSupabase: any

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Setup mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis()
    }

    // Mock createApiClient
    ;(createApiClient as jest.Mock).mockResolvedValue({
      supabase: mockSupabase,
      session: mockSession
    })
  })

  describe('GET /api/cases', () => {
    it('should return cases for authenticated user', async () => {
      // Setup
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [mockCase],
            error: null
          })
        })
      })

      // Execute
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toEqual([mockCase])
      expect(mockSupabase.from).toHaveBeenCalledWith('cases')
    })

    it('should handle database error', async () => {
      // Setup
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' }
          })
        })
      })

      // Execute
      const response = await GET()

      // Assert
      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Database error')
    })
  })

  describe('POST /api/cases', () => {
    const validCase = {
      title: 'New Case',
      description: 'Case Description'
    }

    it('should create case for authenticated patient', async () => {
      // Setup
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: { role: 'patient' },
            error: null
          })
        })
      })

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockCase,
              error: null
            })
          })
        })
      })

      // Execute
      const response = await POST(new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validCase)
      }))

      // Assert
      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data).toEqual(mockCase)
    })

    it('should return 403 if user is not a patient', async () => {
      // Setup
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: { role: 'staff' },
            error: null
          })
        })
      })

      // Execute
      const response = await POST(new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validCase)
      }))

      // Assert
      expect(response.status).toBe(403)
      const data = await response.json()
      expect(data.error).toBe('Only patients can create cases')
    })
  })

  describe('GET /api/cases/[id]', () => {
    it('should return case by ID', async () => {
      // Setup
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockCase,
            error: null
          })
        })
      })

      // Execute
      const response = await GET_SINGLE(
        new Request('http://localhost'),
        { params: { id: 'test-case-id' } }
      )
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toEqual(mockCase)
    })

    it('should return 404 if case not found', async () => {
      // Setup
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      })

      // Execute
      const response = await GET_SINGLE(
        new Request('http://localhost'),
        { params: { id: 'non-existent' } }
      )

      // Assert
      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Case not found')
    })
  })

  describe('PATCH /api/cases/[id]', () => {
    const validUpdate = {
      status: 'in_progress',
      title: 'Updated Title',
      description: 'Updated Description'
    }

    it('should update case for staff/admin', async () => {
      // Setup
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: { role: 'staff' },
            error: null
          })
        })
      })

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { ...mockCase, ...validUpdate },
                error: null
              })
            })
          })
        })
      })

      // Execute
      const response = await PATCH(
        new Request('http://localhost', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validUpdate)
        }),
        { params: { id: 'test-case-id' } }
      )

      // Assert
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual({ ...mockCase, ...validUpdate })
    })

    it('should update case for patient who owns it', async () => {
      // Setup
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: { role: 'patient' },
            error: null
          })
        })
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: { patient_id: mockSession.user.id },
            error: null
          })
        })
      })

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { ...mockCase, ...validUpdate },
                error: null
              })
            })
          })
        })
      })

      // Execute
      const response = await PATCH(
        new Request('http://localhost', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validUpdate)
        }),
        { params: { id: 'test-case-id' } }
      )

      // Assert
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual({ ...mockCase, ...validUpdate })
    })

    it('should return 403 if patient tries to update another patient\'s case', async () => {
      // Setup
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: { role: 'patient' },
            error: null
          })
        })
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: { patient_id: 'different-user-id' },
            error: null
          })
        })
      })

      // Execute
      const response = await PATCH(
        new Request('http://localhost', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validUpdate)
        }),
        { params: { id: 'test-case-id' } }
      )

      // Assert
      expect(response.status).toBe(403)
      const data = await response.json()
      expect(data.error).toBe('You can only update your own cases')
    })
  })
}) 