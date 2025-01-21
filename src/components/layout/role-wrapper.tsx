'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { RoleBasedNav } from './role-based-nav'
import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

// Role-specific layout configurations
const ROLE_LAYOUTS = {
  admin: {
    containerClass: 'max-w-7xl', // Wider layout for admin dashboards
    bgClass: 'bg-background/50',
  },
  staff: {
    containerClass: 'max-w-6xl', // Balanced for staff workflows
    bgClass: 'bg-background/60',
  },
  patient: {
    containerClass: 'max-w-4xl', // Focused for patient views
    bgClass: 'bg-background/70',
  },
}

type RoleWrapperProps = {
  children: ReactNode
}

/**
 * Role-specific layout wrapper that provides appropriate styling and structure
 * based on the user's role. Integrates with RoleBasedNav for navigation.
 */
export function RoleWrapper({ children }: RoleWrapperProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  if (!user?.role) return null

  const layout = ROLE_LAYOUTS[user.role as keyof typeof ROLE_LAYOUTS]

  return (
    <div className="min-h-screen">
      <RoleBasedNav />
      
      <main className={cn(
        'mx-auto px-4 py-6 transition-all duration-300',
        layout.containerClass,
        layout.bgClass
      )}>
        {/* Role-specific content area */}
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          {children}
        </div>
      </main>

      {/* Role-specific footer content could be added here */}
      <footer className="mt-auto py-6 text-center text-sm text-muted-foreground">
        <div className={cn('mx-auto', layout.containerClass)}>
          {user.role === 'patient' && (
            <p>Need help? Contact your healthcare provider.</p>
          )}
          {user.role === 'staff' && (
            <p>For technical support, contact IT department.</p>
          )}
          {user.role === 'admin' && (
            <p>System administration and support.</p>
          )}
        </div>
      </footer>
    </div>
  )
} 