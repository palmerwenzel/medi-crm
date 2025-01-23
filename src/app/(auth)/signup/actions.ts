/**
 * Server actions for signup page
 * Handles user registration and redirects
 */

'use server'

import { createClient } from '@/utils/supabase/server'

/**
 * Signup action with page-specific handling
 * Wraps the base signup action to add any page-specific logic
 */
export async function signUpUser({
  firstName,
  lastName,
  email,
  password,
}: {
  firstName: string
  lastName: string
  email: string
  password: string
}) {
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, user }
} 