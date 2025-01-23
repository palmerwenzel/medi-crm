/**
 * Server actions for admin dashboard
 * Access control handled by RLS policies
 */
'use server'

import { createClient } from '@/utils/supabase/server'

export async function getSystemStats() {
  const supabase = await createClient()

  // Get total users count
  const { count: usersCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  // Get total cases count
  const { count: casesCount } = await supabase
    .from('cases')
    .select('*', { count: 'exact', head: true })

  // Get active staff count
  const { count: staffCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'staff')

  return {
    totalUsers: usersCount || 0,
    totalCases: casesCount || 0,
    activeStaff: staffCount || 0,
  }
} 