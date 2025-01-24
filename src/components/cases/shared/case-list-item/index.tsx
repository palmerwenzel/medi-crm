'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { CaseStatusBadge } from '@/components/cases/case-status-badge'
import { CaseMetadata } from '@/components/cases/case-metadata'
import { SLAIndicator } from '../sla-indicator'
import { cn } from '@/lib/utils'
import { priorityColors } from '@/lib/utils/case-formatting'
import type { CaseResponse } from '@/lib/validations/case'

interface CaseMetadata {
  sla?: {
    response_target: string
    resolution_target: string
    last_updated: string
  }
  tags?: string[]
  internal_notes?: string
  specialties?: string[]
}

interface CaseListItemProps {
  case_: CaseResponse & {
    metadata?: CaseMetadata
  }
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
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect?.(case_.id)
    }
  }, [case_.id, onSelect])

  return (
    <div 
      className={cn('group relative', className)}
    >
      <div className="flex items-start gap-2">
        {onSelect && (
          <div className="pt-4">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(case_.id)}
              aria-label={`Select case ${case_.title}`}
              onKeyDown={handleKeyDown}
            />
          </div>
        )}
        <div className="flex-1">
          <Link href={`${basePath}/${case_.id}`}>
            <Card className={cn(
              'relative overflow-hidden border bg-background/95 p-6 backdrop-blur transition-colors duration-200',
              'hover:bg-accent/5 supports-[backdrop-filter]:bg-background/60',
              isSelected && 'border-primary'
            )}>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold">{case_.title}</h3>
                  <CaseStatusBadge status={case_.status} />
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
                <CaseMetadata 
                  case={case_}
                  showAttachments={true}
                  showAssignedTo={isStaffOrAdmin}
                  showCreatedAt={true}
                  showPatient={true}
                  dateFormat="relative"
                  variant="compact"
                  iconSize="sm"
                />
                {showNotes && case_.internal_notes && (
                  <div className="mt-2 text-sm font-medium text-foreground">
                    Notes: {case_.internal_notes}
                  </div>
                )}
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
} 