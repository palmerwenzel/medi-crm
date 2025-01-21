import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

/**
 * Helper function to create a Supabase client for API routes
 * Handles cookie management and common error cases
 */
export async function createApiClient() {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              // Let Supabase handle cookie options
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              console.error('Error setting cookie:', error)
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              // Let Supabase handle cookie options
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              console.error('Error removing cookie:', error)
            }
          },
        },
      }
    )

    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.error('Session error:', sessionError)
      throw sessionError
    }

    if (!session) {
      console.error('No session found')
      throw new Error('Unauthorized')
    }

    return { supabase, session }
  } catch (error) {
    console.error('Error in createApiClient:', error)
    throw error
  }
}

/**
 * Helper function to handle common API errors
 */
export function handleApiError(error: unknown) {
  console.error('API Error:', error)

  // Handle Supabase errors
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: string }).code
    if (code === 'PGRST301') {
      return NextResponse.json(
        { error: 'Database row level security policy violation' },
        { status: 403 }
      )
    }
  }

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  )
} 