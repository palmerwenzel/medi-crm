import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RoleGuard } from "@/components/auth/guards/role-guard"
import { PatientDetails } from "@/components/patients/patient-details"

interface PageProps {
  params: {
    id: string
  }
}

/**
 * Patient details page
 * Accessible by:
 * - The patient themselves
 * - Staff members
 * - Admins
 */
export default async function PatientPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get user role and check if they can access this patient
  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single()

  // If user is a patient, they can only view their own profile
  if (user?.role === "patient" && session.user.id !== params.id) {
    redirect("/dashboard")
  }

  // Get patient data
  const { data: patient } = await supabase
    .from("users")
    .select(`
      *,
      cases (*)
    `)
    .eq("id", params.id)
    .single()

  if (!patient) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <PatientDetails patient={patient} />
    </div>
  )
} 