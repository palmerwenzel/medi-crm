'use client'

import { useAuth } from './auth-provider'
import type { Database } from '@/types/supabase'
import { Skeleton } from '@/components/ui/skeleton'

type Role = Database['public']['Tables']['users']['Row']['role']

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: Role[]
}

/**
 * Component-level role-based access control
 * @param children - The protected content
 * @param allowedRoles - Array of roles that can access the content
 */
export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-8 w-2/3" />
      </div>
    )
  }

  if (!user?.role || !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}

/**
 * Higher-order component for role-based protection
 * @param Component - Component to protect
 * @param allowedRoles - Array of roles that can access the component
 * @param fallback - Optional component to show when access is denied
 */
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: Array<'admin' | 'staff' | 'patient'>,
  fallback?: React.ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <RoleGuard allowedRoles={allowedRoles}>
        <Component {...props} />
      </RoleGuard>
    )
  }
} 