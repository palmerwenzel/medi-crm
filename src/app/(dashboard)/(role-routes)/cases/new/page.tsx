import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

/**
 * New case creation page
 * Accessible by:
 * - Patients: Can create new cases for themselves
 * - Staff: Can create cases for any patient
 * - Admin: Full access
 */
export default async function NewCasePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get user role
  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single()

  if (!user?.role) {
    redirect("/login")
  }

  // If staff/admin, get list of patients for the dropdown
  let patients = null
  if (user.role === "staff" || user.role === "admin") {
    const { data } = await supabase
      .from("users")
      .select("id, full_name, email")
      .eq("role", "patient")
      .order("full_name")
    
    patients = data
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Case</h1>
        <p className="text-muted-foreground">
          Submit a new medical case for review.
        </p>
      </div>

      {/* We'll create the NewCaseForm component next */}
      <pre>{JSON.stringify({ role: user.role, patients }, null, 2)}</pre>
    </div>
  )
} 