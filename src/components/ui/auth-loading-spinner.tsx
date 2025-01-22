/**
 * Loading spinner component for auth-related operations
 * Used to show loading states during authentication flows
 */

'use client'

import { useAuth } from '@/providers/auth-provider'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'

interface AuthLoadingSpinnerProps {
  children: React.ReactNode
  className?: string
}

export function AuthLoadingSpinner({ children, className }: AuthLoadingSpinnerProps) {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div 
        className={cn(
          "fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-200",
          className
        )} 
        role="status" 
        aria-label="Loading"
      >
        <div className="glass space-y-4 rounded-lg p-6 text-center shadow-lg">
          <div className="flex flex-col items-center gap-4">
            <Logo size="lg" />
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent transition-colors"></div>
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 