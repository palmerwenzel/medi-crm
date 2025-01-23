'use client'

import { useAuth } from "@/providers/auth-provider"
import { type ReactNode } from "react"

interface DashboardWrapperProps {
  children: ReactNode
}

export function DashboardWrapper({ children }: DashboardWrapperProps) {
  const { user, userRole, loading } = useAuth()

  // Show loading state during initial load
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show loading state while waiting for role after auth
  if (user && !userRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center px-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Loading your account...</p>
      </div>
    )
  }

  // Render children (dashboard views) in a container
  // Each view will handle its own role-based visibility
  return (
    <div className="space-y-8">
      {children}
    </div>
  )
} 