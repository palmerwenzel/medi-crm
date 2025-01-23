'use client'

import { useState } from 'react'
import { CaseListItem } from './case-list-item/index'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import type { CaseResponse } from '@/lib/validations/case'

interface CaseListProps {
  cases: CaseResponse[]
  selectedCases?: string[]
  onSelect?: (id: string) => void
  onSelectAll?: () => void
  onDeselectAll?: () => void
  isLoading?: boolean
  showNotes?: boolean
  isStaffOrAdmin?: boolean
  className?: string
}

export function CaseList({
  cases,
  selectedCases = [],
  onSelect,
  onSelectAll,
  onDeselectAll,
  isLoading,
  showNotes,
  isStaffOrAdmin,
  className
}: CaseListProps) {
  if (isLoading) {
    return (
      <Card className="space-y-4 p-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (cases.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No cases found
      </Card>
    )
  }

  const allSelected = cases.length > 0 && selectedCases.length === cases.length
  const someSelected = selectedCases.length > 0 && selectedCases.length < cases.length

  return (
    <Card className="relative overflow-hidden border bg-background/95 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {onSelect && (
        <div className="mb-4 flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onCheckedChange={(checked) => {
              if (checked) {
                onSelectAll?.()
              } else {
                onDeselectAll?.()
              }
            }}
            aria-label="Select all cases"
          />
          <span className="text-sm text-muted-foreground">
            {selectedCases.length} of {cases.length} selected
          </span>
        </div>
      )}

      <div className="space-y-4">
        {cases.map(case_ => (
          <CaseListItem
            key={case_.id}
            case_={case_}
            isSelected={selectedCases.includes(case_.id)}
            onSelect={onSelect}
            showNotes={showNotes}
            isStaffOrAdmin={isStaffOrAdmin}
          />
        ))}
      </div>
    </Card>
  )
} 