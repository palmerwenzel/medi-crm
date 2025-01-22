/**
 * Server actions for authentication
 * Handles user signup, login, and session management
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/supabase'

type Role = Database['public']['Tables']['users']['Row']['role']

export type SignUpFormData = {
  email: string
  password: string
  firstName: string
  lastName: string
}

/**
 * Signs up a new user and creates their profile
 */
export async function signUpUser(formData: SignUpFormData) {
  const supabase = await createClient() // Mutable context in server action

  try {
    // Create auth user with role in app_metadata
    const { data: auth, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          role: 'patient' // Default role for new signups
        }
      }
    })

    if (signUpError) {
      return { error: signUpError.message }
    }

    if (!auth.user) {
      return { error: 'Failed to create user' }
    }

    // Create user profile
    const { error: profileError } = await supabase.from('users').insert([
      {
        id: auth.user.id,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: 'patient', // This should match the role in app_metadata
      },
    ])

    if (profileError) {
      // Cleanup: Delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(auth.user.id)
      return { error: 'Failed to create user profile' }
    }

    // Verify role was properly set
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', auth.user.id)
      .single()

    if (!userData?.role) {
      // Cleanup if role wasn't set
      await supabase.auth.admin.deleteUser(auth.user.id)
      return { error: 'Failed to set user role' }
    }

    // Revalidate all pages that depend on auth state
    revalidatePath('/', 'layout')

    // Redirect to main dashboard
    redirect('/')
  } catch (error: any) {
    // Don't treat redirects as errors
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error // Let Next.js handle the redirect
    }

    console.error('Signup error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export type LoginFormData = {
  email: string
  password: string
}

/**
 * Log in a user and redirect based on their role
 */
export async function loginUser(formData: LoginFormData) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    if (error) {
      return { error: error.message }
    }

    // Verify user has a role assigned
    const { data: { user } } = await supabase.auth.getUser()
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user?.id)
      .single()

    if (!userData?.role) {
      return { error: 'User role not found. Please contact support.' }
    }

    // Revalidate all pages that depend on auth state
    revalidatePath('/', 'layout')

    // Redirect to main dashboard
    redirect('/')
  } catch (error: any) {
    // Don't treat redirects as errors
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error // Let Next.js handle the redirect
    }
    
    console.error('Login error:', error)
    return { error: 'An unexpected error occurred' }
  }
} 