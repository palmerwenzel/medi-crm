import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { CaseManagementView } from "@/components/cases/shared/case-management-view"
import type { UserRole } from '../layout'

export const metadata = {
  title: 'Cases - MediCRM',
  description: 'View and manage medical cases.',
}

/**
 * Cases list page
 * Shows different views based on role:
 * - Staff/Admin: Full management view with bulk actions and tools
 * - Patient: Simple list view of their own cases
 */
export default async function CasesPage() {
  const supabase = createClient()

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

  const role = userData.role as UserRole
  const isStaffOrAdmin = role === 'staff' || role === 'admin'

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Cases</h1>
      <CaseManagementView 
        showActions={isStaffOrAdmin}
        showNotes={isStaffOrAdmin}
        isDashboard={false}
      />
    </div>
  )
} 