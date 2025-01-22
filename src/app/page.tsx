import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // If not logged in, redirect to login
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

  // Redirect to dashboard
  redirect("/dashboard")
}
