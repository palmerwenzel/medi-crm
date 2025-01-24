/**
 * Server actions for login page
 * Handles authentication and redirects
 */

'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

type LoginResponse = {
  success?: boolean
  error?: string
  user?: any
}

/**
 * Login action with page-specific handling
 * Wraps the base login action to add any page-specific logic
 */
export async function loginUser(formData: FormData | { email: string; password: string }): Promise<LoginResponse> {
  try {
    const email = formData instanceof FormData ? formData.get('email') as string : formData.email
    const password = formData instanceof FormData ? formData.get('password') as string : formData.password

    if (!email || !password) {
      return { error: 'Invalid credentials' }
    }

    const cookieStore = cookies()
    const supabase = createClient()

    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: 'Invalid credentials' }
    }

    if (!session) {
      return { error: 'Authentication failed' }
    }

    return { success: true, user: session.user }
  } catch (err) {
    console.error('Login error occurred')
    return { error: 'An unexpected error occurred' }
  }
} 