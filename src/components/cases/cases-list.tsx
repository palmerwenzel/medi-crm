/**
 * Cases List Component
 * Server component for displaying medical cases
 * Uses server actions for data fetching
 */

import { Suspense } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { CaseCard } from './case-card'
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
async function CasesList() {
  const result = await getCases()

  if (!result.success) {
    return <ErrorState message={result.error || 'Failed to load cases'} />
  }

  if (!result.data?.length) {
    return <EmptyCases />
  }

  return <CasesGrid cases={result.data} />
}

// Export wrapped in Suspense boundary
export default function CasesListWrapper() {
  return (
    <Suspense fallback={<LoadingCases />}>
      <CasesList />
    </Suspense>
  )
} 