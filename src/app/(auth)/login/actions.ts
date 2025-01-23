/**
 * Server actions for login page
 * Handles authentication and redirects
 */

'use server'

import { createClient } from '@/utils/supabase/server'

/**
 * Login action with page-specific handling
 * Wraps the base login action to add any page-specific logic
 */
export async function loginUser({
  email,
  password,
}: {
  email: string
  password: string
}) {
  const supabase = createClient()

  const { data: { session }, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, user: session?.user }
} 