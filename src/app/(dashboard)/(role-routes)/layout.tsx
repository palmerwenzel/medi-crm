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
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user role from the users table
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!userData?.role) {
    redirect("/login")
  }

  return <>{children}</>
} 