/**
 * Server actions for login page
 * Handles authentication and redirects
 */

'use server'

import { loginUser as baseLoginUser } from '@/lib/actions/auth'
import type { LoginFormData } from '@/lib/actions/auth'

/**
 * Login action with page-specific handling
 * Wraps the base login action to add any page-specific logic
 */
export async function loginUser(formData: LoginFormData) {
  // Here we can add any login page specific logic
  // For example: analytics, logging, etc.
  return baseLoginUser(formData)
} 