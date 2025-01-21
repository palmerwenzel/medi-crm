'use client'

import { useAuth } from './auth-provider'

export function AuthLoading({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Loading">
        <div className="space-y-4 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 