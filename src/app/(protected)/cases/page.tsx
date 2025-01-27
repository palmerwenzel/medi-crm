import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { CaseManagementView } from "@/components/cases/shared/case-management-view"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import type { UserRole } from '../layout'

export const metadata = {
  title: 'Cases - TonIQ',
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
  const isPatient = role === 'patient'

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Cases</h1>
        {isPatient && (
          <Button asChild>
            <Link href="/cases/new" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Case
            </Link>
          </Button>
        )}
      </div>
      <CaseManagementView 
        showActions={isStaffOrAdmin}
        showNotes={isStaffOrAdmin}
        isDashboard={false}
      />
    </div>
  )
} 