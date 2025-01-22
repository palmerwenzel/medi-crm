/**
 * Role-based access control component and HOC
 * Protects content based on user roles from Supabase
 */

'use client'

import { useAuth } from '@/providers/auth-provider'
import type { Database } from '@/types/supabase'
import { Skeleton } from '@/components/ui/skeleton'
import { redirect } from "next/navigation"

type Role = Database['public']['Tables']['users']['Row']['role']

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: Array<'patient' | 'staff' | 'admin'>
  fallbackUrl?: string
}

/**
 * Component-level role-based access control
 * @param children - The protected content
 * @param allowedRoles - Array of roles that can access the content
 */
export function RoleGuard({
  children,
  allowedRoles,
  fallbackUrl = '/dashboard'
}: RoleGuardProps) {
  const { user, userRole } = useAuth()

  if (!user || !userRole) {
    redirect('/login')
  }

  if (!allowedRoles.includes(userRole)) {
    redirect(fallbackUrl)
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