import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import type { UserRole } from '../layout'

// Role-specific dashboard components
import { StaffDashboard } from '@/components/dashboard/views/staff-dashboard'
import { PatientDashboard } from '@/components/dashboard/views/patient-dashboard'
import { AdminDashboard } from '@/components/dashboard/views/admin-dashboard'

export default async function DashboardPage() {
  const headersList = headers()
  const supabase = createClient()

  // Get user role from the protected layout
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/login')
  }

  const { data: userData, error: roleError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (roleError || !userData?.role) {
    redirect('/login')
  }

  // Render the appropriate dashboard based on user role
  const role = userData.role as UserRole
  switch (role) {
    case 'staff':
      return <StaffDashboard />
    case 'patient':
      return <PatientDashboard />
    case 'admin':
      return <AdminDashboard />
    default:
      redirect('/login')
  }
} 