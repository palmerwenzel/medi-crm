import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PatientDashboard } from "@/components/dashboard/views/patient-dashboard"
import { StaffDashboard } from "@/components/dashboard/views/staff-dashboard"
import { AdminDashboard } from "@/components/dashboard/views/admin-dashboard"
import { Database } from "@/types/supabase"

export default async function DashboardPage() {
  console.log('[DASHBOARD PAGE] Processing request')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  console.log('[DASHBOARD PAGE] User authenticated:', !!user)

  if (!user) {
    console.log('[DASHBOARD PAGE] Redirecting to /login - No user')
    redirect("/login")
  }

  // Get user role and profile from the users table
  const { data: userData } = await supabase
    .from("users")
    .select("*")  // Get all user fields for the profile section
    .eq("id", user.id)
    .single()

  console.log('[DASHBOARD PAGE] User data:', userData)

  if (!userData) {
    console.log('[DASHBOARD PAGE] Redirecting to /login - No user data')
    redirect("/login")
  }

  // Render different dashboard based on role
  console.log('[DASHBOARD PAGE] Rendering dashboard for role:', userData.role)
  switch (userData.role) {
    case "patient":
      return <PatientDashboard />
    case "staff":
      return <StaffDashboard />
    case "admin":
      return <AdminDashboard />
    default:
      // Default view for debugging or when role is not set
      return (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to MediCRM. Your current role is: {userData.role || "Not Set"}
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
            <div className="space-y-2">
              <p><strong>Name:</strong> {userData.first_name} {userData.last_name}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Role:</strong> {userData.role || "Not Set"}</p>
              <p><strong>Account Created:</strong> {new Date(userData.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {!userData.role && (
            <div className="rounded-lg border bg-destructive/10 p-6">
              <h2 className="text-xl font-semibold mb-2 text-destructive">Role Not Set</h2>
              <p>Your user account does not have a role assigned. Please contact an administrator.</p>
            </div>
          )}
        </div>
      )
  }
} 