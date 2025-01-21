'use client'

import { useAuth } from './auth-provider'
import { type ReactNode } from 'react'

type RoleGuardProps = {
  children: ReactNode
  allowedRoles: Array<'admin' | 'staff' | 'patient'>
  fallback?: ReactNode
}

/**
 * Component-level role-based access control
 * @param children - The protected content
 * @param allowedRoles - Array of roles that can access the content
 * @param fallback - Optional component to show when access is denied
 */
export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback = null 
}: RoleGuardProps) {
  const { user, loading } = useAuth()
  
  // Show nothing while loading
  if (loading) return null
  
  // If no user or role doesn't match, show fallback
  if (!user?.role || !allowedRoles.includes(user.role)) {
    return fallback
  }

  // User has permission, show protected content
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
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <RoleGuard allowedRoles={allowedRoles} fallback={fallback}>
        <Component {...props} />
      </RoleGuard>
    )
  }
} 