import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Header } from '@/components/dashboard/header'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'

// Types for role-based access
export type UserRole = 'admin' | 'staff' | 'patient'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
      <div className="flex flex-1">
        <aside className="hidden md:block w-[80px]">
          <DashboardNav />
        </aside>
        <main className="flex-1 h-[calc(100vh-80px)] overflow-hidden">
          <div className="h-full p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 