/**
 * Server actions for staff dashboard
 * Access control handled by RLS policies
 */
'use server'

import { createClient } from '@/utils/supabase/server'

export async function getDashboardStats(userId: string) {
  const supabase = await createClient()

  // Get assigned cases count
  const { count: casesCount } = await supabase
    .from('cases')
    .select('*', { count: 'exact', head: true })
    .eq('assigned_to', userId)
    .eq('status', 'active')

  // Get total patients count
  const { count: patientsCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'patient')

  return {
    activeCases: casesCount || 0,
    totalPatients: patientsCount || 0,
    upcomingAppointments: 0, // To be implemented with appointments table
  }
} 