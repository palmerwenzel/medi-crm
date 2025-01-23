import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { Header } from '@/components/dashboard/header'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'

// Types for role-based access
export type UserRole = 'admin' | 'staff' | 'patient'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = headers()
  const supabase = createClient()

  // Verify auth and get user data
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    console.error('[Auth] No valid user session:', userError?.message)
    redirect('/login')
  }

  // Get user role (required for our app's RBAC)
  const { data: userData, error: roleError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (roleError || !userData?.role) {
    console.error('[Auth] Failed to get user role:', roleError?.message)
    redirect('/login')
  }

  // Validate role type
  const role = userData.role as UserRole
  if (!['admin', 'staff', 'patient'].includes(role)) {
    console.error('[Auth] Invalid role type:', role)
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="relative h-full py-6 pl-8 pr-6 lg:py-8">
            <DashboardNav />
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
} 