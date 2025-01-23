import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { PatientDetails } from "@/components/patients/patient-details"

interface PageProps {
  params: {
    id: string
  }
}

/**
 * Patient details page
 * Relies on middleware for auth and client components for role checks
 */
export default async function PatientPage({ params }: PageProps) {
  const supabase = await createClient()

  // Get patient data - RLS policies will handle access control
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