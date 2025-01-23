import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export type ApiError = {
  status: number
  message: string
  details?: unknown
}

/**
 * Creates a Supabase client configured for API routes
 * Also returns user and role information if available
 */
export async function createApiClient() {
  const supabase = createClient()
  
  // Get user session
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  
  if (!user) {
    throw createApiError(401, 'Unauthorized')
  }

  // Get user role from metadata
  const role = user.user_metadata.role || 'patient'

  return { supabase, user, role }
}

/**
 * Creates a standardized API error
 */
export function createApiError(
  status: number,
  message: string,
  details?: unknown
): ApiError {
  return { status, message, details }
}

/**
 * Handles API errors and converts them to proper responses
 */
export function handleApiError(error: unknown): NextResponse {
  // Handle known API errors
  if ((error as ApiError).status) {
    const apiError = error as ApiError
    return NextResponse.json(
      { error: apiError.message, details: apiError.details },
      { status: apiError.status }
    )
  }

  // Handle unknown errors
  console.error('API Error:', error)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
} 