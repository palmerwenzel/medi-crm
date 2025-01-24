/**
 * Server actions for signup page
 * Handles user registration and redirects
 */

'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

type SignUpResponse = {
  success?: boolean
  error?: string
  user?: any
}

type SignUpData = {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword?: string
}

export async function signUpUser(formData: FormData | SignUpData): Promise<SignUpResponse> {
  try {
    let data: SignUpData
    
    if (formData instanceof FormData) {
      data = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      }
    } else {
      data = formData
    }

    if (!data.email || !data.password || !data.firstName || !data.lastName) {
      return { error: 'All fields are required' }
    }

    const supabase = createClient()

    const { data: { user }, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
        }
      }
    })

    if (error) {
      console.error('Signup error occurred')
      return { error: 'Failed to create account' }
    }

    if (!user) {
      return { error: 'Failed to create account' }
    }

    return { success: true, user }
  } catch (err) {
    console.error('Signup error occurred')
    return { error: 'An unexpected error occurred' }
  }
} 