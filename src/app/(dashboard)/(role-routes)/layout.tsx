import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

/**
 * Layout wrapper for role-based routes
 * Ensures user has a valid role before rendering children
 */
export default async function RoleBasedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get user role from the users table
  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single()

  if (!user?.role) {
    redirect("/login")
  }

  return <>{children}</>
} 