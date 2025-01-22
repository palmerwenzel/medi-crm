import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import CasesList from "@/components/cases/cases-list"
import { buttonVariants } from "@/components/ui/button"

export const metadata = {
  title: 'Cases - MediCRM',
  description: 'View and manage medical cases.',
}

/**
 * Cases list page
 * Shows different views based on role:
 * - Patients: See their own cases
 * - Staff: See assigned cases
 * - Admin: See all cases
 */
export default async function CasesPage() {
  const supabase = await createClient()

  // The server client automatically handles cookie-based auth
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
          <h1 className="text-3xl font-bold tracking-tight">Cases</h1>
          <p className="text-muted-foreground">
            {userData.role === 'patient' 
              ? 'View and manage your medical cases.'
              : 'View and manage all medical cases.'}
          </p>
        </div>
        {userData.role === 'patient' && (
          <Link 
            href="/cases/new"
            className={buttonVariants({ variant: "default" })}
          >
            Create New Case
          </Link>
        )}
      </div>

      <CasesList />
    </div>
  )
} 