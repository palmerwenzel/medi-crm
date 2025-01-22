/**
 * Server actions for signup page
 * Handles user registration and redirects
 */

'use server'

import { signUpUser as baseSignUpUser } from '@/lib/actions/auth'
import type { SignUpFormData } from '@/lib/actions/auth'

/**
 * Signup action with page-specific handling
 * Wraps the base signup action to add any page-specific logic
 */
export async function signUpUser(formData: SignUpFormData) {
  // Here we can add any signup page specific logic
  // For example: analytics, logging, etc.
  return baseSignUpUser(formData)
} 