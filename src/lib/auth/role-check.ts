/**
 * Server-side role check utilities
 * Uses Supabase server client for secure role validation
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Database } from '@/types/supabase'

type Role = Database['public']['Tables']['users']['Row']['role']

/**
 * Get user role or redirect to login
 * @returns User role or redirects if not authenticated
 */
export async function getUserRoleOrRedirect(): Promise<Role> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData?.role) {
    console.error('User role not found:', user.id)
    redirect('/login')
  }

  return userData.role
}

/**
 * Verify user has required role or redirect
 * @param allowedRoles - Array of roles that can access the content
 * @returns User role if authorized
 */
export async function verifyRoleOrRedirect(allowedRoles: Role[]): Promise<Role> {
  const role = await getUserRoleOrRedirect()
  
  if (!allowedRoles.includes(role)) {
    redirect('/')
  }

  return role
} 