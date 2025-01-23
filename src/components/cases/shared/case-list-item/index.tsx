'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { CaseStatusBadge } from '@/components/cases/case-status-badge'
import { CasePriorityBadge } from '@/components/cases/case-priority-badge'
import { CaseMetadata } from '@/components/cases/case-metadata'
import { SLAIndicator } from '../sla-indicator'
import { cn } from '@/lib/utils'
import { formatDate, statusColors, priorityColors } from '@/lib/utils/case-formatting'
import type { CaseResponse } from '@/lib/validations/case'

interface CaseListItemProps {
  case_: CaseResponse
  isSelected?: boolean
  onSelect?: (id: string) => void
  showNotes?: boolean
  basePath?: string
  isStaffOrAdmin?: boolean
  className?: string
}

export function CaseListItem({
  case_,
  isSelected,
  onSelect,
  showNotes = false,
  basePath = '/cases',
  isStaffOrAdmin = false,
  className
}: CaseListItemProps) {
  // Handle keyboard interactions
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Space or Enter to toggle selection
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      onSelect?.(case_.id)
    }
  }, [case_.id, onSelect])

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-start gap-2">
        {onSelect && (
          <div className="pt-4">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(case_.id)}
              aria-label={`Select case ${case_.title}`}
            />
          </div>
        )}
        <div className="flex-1">
          <div className="space-y-3 rounded-lg border p-6 backdrop-blur-[2px] bg-background/95">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`${basePath}/${case_.id}`}
                className="hover:underline font-medium"
              >
                {case_.title}
              </Link>
              <Badge variant="outline" className={cn('border', statusColors[case_.status])}>
                {case_.status.replace('_', ' ')}
              </Badge>
              {case_.priority && (
                <Badge variant="outline" className={cn('border', priorityColors[case_.priority])}>
                  {case_.priority}
                </Badge>
              )}
              {case_.metadata?.sla && (
                <SLAIndicator sla={case_.metadata.sla} />
              )}
              {case_.metadata?.specialties && case_.metadata.specialties.length > 0 && (
                <div className="flex gap-1">
                  {case_.metadata.specialties.map(specialty => (
                    <Badge key={specialty} variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                      {specialty.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              )}
              {case_.metadata?.tags && case_.metadata.tags.length > 0 && (
                <div className="flex gap-1">
                  {case_.metadata.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {case_.description}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>Created {formatDate(case_.created_at)}</span>
              {case_.patient && (
                <span>
                  Patient: {case_.patient.first_name} {case_.patient.last_name}
                </span>
              )}
              {showNotes && case_.internal_notes && (
                <span className="font-medium text-foreground">
                  Notes: {case_.internal_notes}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 