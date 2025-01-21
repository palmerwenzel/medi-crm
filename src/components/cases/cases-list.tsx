import { Suspense } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { CaseCard } from './case-card'
import type { CaseResponse } from '@/lib/validations/case'

interface CasesListProps {
  cases: CaseResponse[]
  error?: string
}

function CaseCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}

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

export function CasesList({ cases, error }: CasesListProps) {
  if (error) {
    return (
      <Alert variant="destructive" role="alert">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!cases?.length) {
    return (
      <div className="rounded-lg border bg-card p-8">
        <div className="flex h-[200px] items-center justify-center text-muted-foreground">
          No cases yet. Create your first case to get started.
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<LoadingCases />}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cases.map((caseData) => (
          <CaseCard key={caseData.id} case={caseData} />
        ))}
      </div>
    </Suspense>
  )
} 