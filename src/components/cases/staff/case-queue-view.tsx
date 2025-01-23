/**
 * Staff Case Queue View
 * Extends CaseManagementView with staff-specific features and optimizations
 * 
 * @component
 * @example
 * ```tsx
 * <CaseQueueView />
 * ```
 * 
 * @remarks
 * This component enforces role-based access control, only allowing staff and admin users.
 * It provides loading states and animations for a smooth user experience.
 */
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { CaseManagementView } from '../shared/case-management-view'
import { PerformanceMetrics } from './performance-metrics'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { useCaseManagement } from '@/hooks/cases/use-case-management'
import { cn } from '@/lib/utils'

interface CaseQueueViewProps {
  className?: string
}

export function CaseQueueView({ className }: CaseQueueViewProps) {
  const { user, userRole, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { cases } = useCaseManagement({})

  // Redirect non-staff users
  useEffect(() => {
    if (user && !['staff', 'admin'].includes(userRole || '')) {
      toast({
        title: 'Access Denied',
        description: 'Only staff members can access the case queue.',
        variant: 'destructive',
      })
      router.push('/dashboard')
    }
  }, [user, userRole, router, toast])

  if (authLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <Skeleton className="h-[52px] w-full rounded-lg" />
        <Card className="relative overflow-hidden border bg-background/95 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  if (!user || !['staff', 'admin'].includes(userRole || '')) {
    return null
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className={cn('space-y-4', className)}
      >
        <Card className="relative overflow-hidden border bg-background/95 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <PerformanceMetrics 
            cases={cases} 
            timeframe="week"
          />
        </Card>

        <CaseManagementView
          showNotes
          showActions
          isDashboard={false}
        />
      </motion.div>
    </AnimatePresence>
  )
} 