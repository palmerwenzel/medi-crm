import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

/**
 * Cases list page
 * Shows different views based on role:
 * - Patients: See their own cases
 * - Staff: See assigned cases
 * - Admin: See all cases
 */
export default async function CasesPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get user role and cases based on role
  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single()

  if (!user?.role) {
    redirect("/login")
  }

  let casesQuery = supabase
    .from("cases")
    .select(`
      *,
      patient:users!cases_patient_id_fkey (
        id,
        full_name,
        email
      ),
      assigned_to:users!cases_assigned_to_fkey (
        id,
        full_name
      )
    `)

  // Filter cases based on role
  if (user.role === "patient") {
    casesQuery = casesQuery.eq("patient_id", session.user.id)
  } else if (user.role === "staff") {
    casesQuery = casesQuery.eq("assigned_to", session.user.id)
  }
  // Admin sees all cases

  const { data: cases } = await casesQuery.order("created_at", { ascending: false })

  return (
    <div>
      {/* We'll create the CasesList component next */}
      <pre>{JSON.stringify(cases, null, 2)}</pre>
    </div>
  )
} 