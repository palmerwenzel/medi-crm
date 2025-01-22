import { NextResponse } from 'next/server'
import { GET, POST } from '../route'
import { GET as GET_SINGLE, PATCH } from '../[id]/route'
import { createApiClient } from '@/lib/supabase/api'

// Mock dependencies
jest.mock('@/lib/supabase/api')

// Mock NextResponse
const mockJson = jest.fn()
jest.mock('next/server', () => ({
  NextResponse: {
    json: (...args: any[]) => {
      mockJson(...args)
      const [data, options] = args
      const response = new Response(JSON.stringify(data), {
        status: options?.status || 200,
        headers: { 'Content-Type': 'application/json' }
      })
      Object.defineProperty(response, 'json', {
        value: async () => data
      })
      return response
    }
  }
}))

// Mock types
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  app_metadata: { role: 'patient' }
}

const mockSession = {
  user: mockUser,
  access_token: 'mock-token',
  refresh_token: 'mock-refresh-token'
}

const mockCase = {
  id: 'test-case-id',
  patient_id: 'test-user-id',
  assigned_to: null,
  title: 'Test Case',
  description: 'Test Description',
  status: 'open',
  priority: 'medium',
  category: 'general',
  attachments: [],
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
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockReturnValue({
              data: mockCase,
              error: null
            })
          }),
          order: jest.fn().mockReturnValue({
            data: [mockCase],
            error: null
          })
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockReturnValue({
              data: mockCase,
              error: null
            })
          })
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockReturnValue({
                data: { ...mockCase },
                error: null
              })
            })
          })
        }),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: null,
            error: null
          })
        })
      }),
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        getSession: jest.fn().mockResolvedValue({ data: { session: mockSession }, error: null })
      }
    }

    // Mock createApiClient
    ;(createApiClient as jest.Mock).mockResolvedValue({
      supabase: mockSupabase,
      user: mockUser,
      role: mockUser.app_metadata.role
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

      // Assert
      expect(mockJson).toHaveBeenCalledWith([mockCase])
      expect(response.status).toBe(200)
      const data = await response.json()
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
      expect(mockJson).toHaveBeenCalledWith(
        { error: 'Database error' },
        { status: 500 }
      )
      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Database error')
    })
  })

  describe('POST /api/cases', () => {
    const validCase = {
      title: 'New Case',
      description: 'Case Description',
      priority: 'medium',
      category: 'general'
    }

    it('should create case for authenticated patient', async () => {
      // Setup
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'patient' },
              error: null
            })
          })
        })
      })

      mockSupabase.from.mockReturnValueOnce({
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
      expect(mockJson).toHaveBeenCalledWith(mockCase, { status: 201 })
      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data).toEqual(mockCase)
    })

    it('should return 403 if user is not a patient', async () => {
      // Setup - Mock user as staff
      ;(createApiClient as jest.Mock).mockResolvedValueOnce({
        supabase: mockSupabase,
        user: { ...mockUser, app_metadata: { role: 'staff' } },
        role: 'staff'
      })

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'staff' },
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
      expect(mockJson).toHaveBeenCalledWith(
        { error: 'Only patients can create cases' },
        { status: 403 }
      )
      expect(response.status).toBe(403)
      const data = await response.json()
      expect(data.error).toBe('Only patients can create cases')
    })
  })

  describe('GET /api/cases/[id]', () => {
    it('should return case by ID', async () => {
      // Setup
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockCase,
              error: null
            })
          })
        })
      })

      // Execute
      const response = await GET_SINGLE(
        new Request('http://localhost'),
        { params: { id: 'test-case-id' } }
      )

      // Assert
      expect(mockJson).toHaveBeenCalledWith(mockCase)
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual(mockCase)
    })

    it('should return 404 if case not found', async () => {
      // Setup
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      })

      // Execute
      const response = await GET_SINGLE(
        new Request('http://localhost'),
        { params: { id: 'non-existent' } }
      )

      // Assert
      expect(mockJson).toHaveBeenCalledWith(
        { error: 'Case not found' },
        { status: 404 }
      )
      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Case not found')
    })
  })

  describe('PATCH /api/cases/[id]', () => {
    const validUpdate = {
      status: 'in_progress',
      title: 'Updated Title',
      description: 'Updated Description',
      priority: 'high',
      category: 'followup',
      assigned_to: 'staff-user-id'
    }

    it('should update case for staff/admin', async () => {
      // Setup - Mock user as staff
      ;(createApiClient as jest.Mock).mockResolvedValueOnce({
        supabase: mockSupabase,
        user: { ...mockUser, app_metadata: { role: 'staff' } },
        role: 'staff'
      })

      // Mock user role lookup
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'staff' },
              error: null
            })
          })
        })
      })

      // Mock assigned user lookup
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'staff' },
              error: null
            })
          })
        })
      })

      // Mock case update
      mockSupabase.from.mockReturnValueOnce({
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
      expect(mockJson).toHaveBeenCalledWith({ ...mockCase, ...validUpdate })
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual({ ...mockCase, ...validUpdate })
    })

    it('should validate case assignment to staff/admin only', async () => {
      // Setup - Mock user as staff
      ;(createApiClient as jest.Mock).mockResolvedValueOnce({
        supabase: mockSupabase,
        user: { ...mockUser, app_metadata: { role: 'staff' } },
        role: 'staff'
      })

      // Mock user role lookup
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'staff' },
              error: null
            })
          })
        })
      })

      // Mock assigned user lookup
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'patient' },
              error: null
            })
          })
        })
      })

      const invalidAssignment = {
        ...validUpdate,
        assigned_to: 'patient-user-id' // Invalid: trying to assign to a patient
      }

      // Execute
      const response = await PATCH(
        new Request('http://localhost', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invalidAssignment)
        }),
        { params: { id: 'test-case-id' } }
      )

      // Assert
      expect(mockJson).toHaveBeenCalledWith(
        { error: 'Cases can only be assigned to staff or admin users' },
        { status: 400 }
      )
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Cases can only be assigned to staff or admin users')
    })
  })
}) 