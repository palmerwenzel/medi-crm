/**
 * Server actions for signup page
 * Handles user registration and redirects
 */

'use server'

import { createClient } from '@/utils/supabase/server'
import { User } from '@supabase/supabase-js'

type SignUpResponse = {
  success?: boolean
  error?: string
  user?: User
}

type SignUpData = {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword?: string
  role: 'patient' | 'staff'
  department?: string
  specialty?: string
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
        role: formData.get('role') as 'patient' | 'staff',
        department: formData.get('department') as string,
        specialty: formData.get('specialty') as string,
      }
    } else {
      data = formData
    }

    if (!data.email || !data.password || !data.firstName || !data.lastName || !data.role) {
      return { error: 'All required fields must be filled' }
    }

    // Validate staff-specific fields
    if (data.role === 'staff' && (!data.department || !data.specialty)) {
      return { error: 'Department and specialty are required for staff members' }
    }

    const supabase = createClient()

    // First create the auth user
    const { data: { user }, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          role: data.role,
          department: data.department,
          specialty: data.specialty
        }
      }
    })

    if (authError) {
      console.error('Auth signup error:', authError)
      return { error: authError.message }
    }

    if (!user) {
      return { error: 'Failed to create account' }
    }

    // Then create the user profile with role-specific data
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        role: data.role,
        department: data.department,
        specialty: data.specialty
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(user.id)
      return { error: 'Failed to create user profile' }
    }

    return { success: true, user }
  } catch (err) {
    console.error('Signup error:', err)
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred' }
  }
} 