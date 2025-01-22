import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NewCaseForm } from "@/components/cases/new-case-form"

/**
 * New case creation page
 * Accessible by:
 * - Patients: Can create new cases for themselves
 * - Staff: Can create cases for any patient
 * - Admin: Full access
 */
export const metadata = {
  title: 'Create New Case - MediCRM',
  description: 'Submit a new medical case for review.',
}

export default async function NewCasePage() {
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

  // Only patients can create cases
  if (userData.role !== "patient") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Case</h1>
        <p className="text-muted-foreground">
          Submit a new case and we'll get back to you as soon as possible.
        </p>
      </div>

      <NewCaseForm />
    </div>
  )
} 