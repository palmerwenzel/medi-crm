import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CaseList } from "@/components/cases/shared/case-list"

export const metadata = {
  title: 'Cases Overview - MediCRM',
  description: 'View and manage your medical cases.',
}

/**
 * Dashboard cases overview
 * Shows a role-filtered list of cases with quick actions
 */
export default async function DashboardCasesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user role
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!userData?.role) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cases Overview</h1>
          <p className="text-muted-foreground">
            {userData.role === 'patient' 
              ? 'View and manage your medical cases'
              : userData.role === 'staff'
              ? 'Manage assigned cases and patient care'
              : 'Overview of all cases in the system'}
          </p>
        </div>
      </div>

      <CaseList 
        userRole={userData.role}
        userId={user.id}
        isDashboard={true}
        limit={5}
      />
    </div>
  )
} 