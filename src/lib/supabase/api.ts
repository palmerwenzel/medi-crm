/**
 * Helper functions for API routes
 * Uses Supabase server client with proper JWT validation
 */

import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'
import { createClient } from './server'

/**
 * Custom API error class for standardized error handling
 */
export class ApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Helper function to create a Supabase client for API routes
 * Extends the base server client with API-specific features
 */
export async function createApiClient() {
  try {
    // Use base server client
    const supabase = await createClient()

    // Get and validate the session JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      throw new ApiError(401, 'Invalid or expired token')
    }

    if (!user) {
      throw new ApiError(401, 'Unauthorized')
    }

    // Get role from JWT metadata
    const role = user.app_metadata.role
    if (!role) {
      throw new ApiError(403, 'User role not found')
    }

    return { 
      supabase, 
      user,
      role: role as Database['public']['Tables']['users']['Row']['role']
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    console.error('Error in createApiClient:', error)
    throw new ApiError(500, 'Internal server error')
  }
}

/**
 * Create a standardized API error
 */
export function createApiError(code: number, message: string, details?: unknown): ApiError {
  return new ApiError(code, message, details)
}

/**
 * Handle API errors and return appropriate response
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: error.code }
    )
  }

  // Default to 500 for unknown errors
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}