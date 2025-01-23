import { redirect } from "next/navigation"

/**
 * Root page that redirects to dashboard or login
 * Relies on middleware for auth checks
 */
export default function RootPage() {
  console.log('[ROOT PAGE] Redirecting to /dashboard')
  redirect("/dashboard")
}
