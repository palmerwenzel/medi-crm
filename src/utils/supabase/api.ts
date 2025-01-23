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
  
  // Get authenticated user data
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    throw createApiError(401, 'Unauthorized')
  }

  // Get user role from database
  const { data: userData, error: dbError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (dbError || !userData) {
    throw createApiError(401, 'User not found')
  }

  return { supabase, user, role: userData.role }
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