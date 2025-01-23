/**
 * Cases List Component
 * Client component for displaying medical cases with role-based filtering
 * Uses useAuth for role checks and server actions for data fetching
 */

'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { CaseCard } from './case-card'
import { useAuth } from '@/providers/auth-provider'
import { getCases } from '@/lib/actions/cases'
import type { CaseResponse } from '@/lib/validations/case'

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

// Main cases list component
function CasesList() {
  const { user } = useAuth()
  const [cases, setCases] = useState<CaseResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCases() {
      if (!user) return

      try {
        const result = await getCases()
        if (!result.success) {
          throw new Error(result.error)
        }
        setCases(result.data || [])
      } catch (err) {
        console.error('Error loading cases:', err)
        setError('Failed to load cases')
      } finally {
        setIsLoading(false)
      }
    }

    loadCases()
  }, [user])

  if (isLoading) return <LoadingCases />
  if (error) return <ErrorState message={error} />
  if (!cases.length) return <EmptyCases />

  return <CasesGrid cases={cases} />
}

export { CasesList } 