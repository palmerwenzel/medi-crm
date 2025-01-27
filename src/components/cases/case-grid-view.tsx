/**
 * Case Grid View Component
 * Grid-based view of cases with loading states
 * Used for overview pages and simpler case displays
 */
'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CaseStatusBadge } from './case-status-badge'
import { CasePriorityBadge } from './case-priority-badge'
import { CaseMetadata } from './case-metadata'
import { useAuth } from '@/providers/auth-provider'
import { getCases } from '@/lib/actions/cases'
import { useCaseSubscription } from '@/lib/features/cases/use-case-subscription'
import type { CaseResponse } from '@/types/domain/cases'
import { isAdminRole, isPatientRole, isStaffRole } from '@/lib/utils/role-guards'

// Loading skeleton for cases
function CaseCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}

// Loading state component
function LoadingCases() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-6">
          <CaseCardSkeleton />
        </div>
      ))}
    </div>
  )
}

// Empty state component
function EmptyCases() {
  return (
    <div className="rounded-lg border bg-card p-8">
      <div className="flex h-[200px] items-center justify-center text-muted-foreground">
        No cases yet. Create your first case to get started.
      </div>
    </div>
  )
}

// Error state component
function ErrorState({ message }: { message: string }) {
  return (
    <Alert variant="destructive" role="alert">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

// Individual case card
function CaseCard({ case: caseData }: { case: CaseResponse }) {
  const caseUrl = `/cases/${caseData.id}`

  return (
    <Card className="h-full glass-sm-hover transition-colors">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium line-clamp-1">{caseData.title}</h3>
          <CaseStatusBadge status={caseData.status} />
        </div>
        {caseData.priority === 'high' || caseData.priority === 'urgent' ? (
          <CasePriorityBadge priority={caseData.priority} />
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {caseData.description}
        </p>
        <CaseMetadata case={caseData} />
        <Button variant="ghost" asChild className="w-full">
          <Link href={caseUrl}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// Cases grid component
function CasesGrid({ cases }: { cases: CaseResponse[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cases.map((caseData) => (
        <CaseCard key={caseData.id} case={caseData} />
      ))}
    </div>
  )
}

// Main case grid view component
export function CaseGridView() {
  const { user, userRole } = useAuth()
  const [cases, setCases] = useState<CaseResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load initial cases
  useEffect(() => {
    async function loadCases() {
      if (!user) return

      try {
        const result = await getCases()
        if (!result.success) {
          throw new Error(result.error)
        }
        setCases(result.data?.cases || [])
      } catch (err) {
        console.error('Error loading cases:', err)
        setError('Failed to load cases')
      } finally {
        setIsLoading(false)
      }
    }

    loadCases()
  }, [user])

  // Subscribe to real-time updates
  useCaseSubscription({
    onUpdate: (updatedCase) => {
      // Only update if the case belongs to the current user (based on role)
      const shouldInclude = userRole && (
        isAdminRole(userRole) || 
        (isPatientRole(userRole) && updatedCase.patient_id === user?.id) ||
        (isStaffRole(userRole) && updatedCase.assigned_to?.id === user?.id)
      )

      if (shouldInclude) {
        setCases(prev => prev.map(c => 
          c.id === updatedCase.id ? updatedCase : c
        ))
      }
    },
    onNew: (newCase) => {
      // Only add if the case belongs to the current user (based on role)
      const shouldInclude = userRole && (
        isAdminRole(userRole) || 
        (isPatientRole(userRole) && newCase.patient_id === user?.id) ||
        (isStaffRole(userRole) && newCase.assigned_to?.id === user?.id)
      )

      if (shouldInclude) {
        setCases(prev => [newCase, ...prev])
      }
    }
  })

  if (isLoading) return <LoadingCases />
  if (error) return <ErrorState message={error} />
  if (!cases.length) return <EmptyCases />

  return <CasesGrid cases={cases} />
} 