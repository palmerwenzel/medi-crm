import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function RootPage() {
  console.log('[ROOT PAGE] Processing request')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  console.log('[ROOT PAGE] User authenticated:', !!user)

  // If not logged in, redirect to login
  if (!user) {
    console.log('[ROOT PAGE] Redirecting to /login - No user')
    redirect("/login")
  }

  // Get user role
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  console.log('[ROOT PAGE] User role:', userData?.role)

  if (!userData?.role) {
    console.log('[ROOT PAGE] Redirecting to /login - No role')
    redirect("/login")
  }

  // Redirect to dashboard
  console.log('[ROOT PAGE] Redirecting to /dashboard')
  redirect("/dashboard")
}
