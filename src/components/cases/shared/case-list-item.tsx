import { Card, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CaseStatusBadge } from '@/components/cases/case-status-badge'
import { CasePriorityBadge } from '@/components/cases/case-priority-badge'
import { CaseMetadata } from '@/components/cases/case-metadata'
import { InternalNotesEditor } from '../staff/internal-notes-editor'
import { motion, AnimatePresence } from 'framer-motion'
import type { CaseResponse, CaseStatus, CasePriority } from '@/lib/validations/case'
import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { StickyNote } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

// Utility functions
function getStatusVariant(status: CaseStatus): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'open':
      return 'default'
    case 'in_progress':
      return 'secondary'
    case 'resolved':
      return 'destructive'
    default:
      return 'default'
  }
}

function getPriorityVariant(priority: CasePriority): 'default' | 'secondary' | 'destructive' {
  switch (priority) {
    case 'low':
      return 'default'
    case 'medium':
      return 'secondary'
    case 'high':
    case 'urgent':
      return 'destructive'
    default:
      return 'default'
  }
}

function formatStatus(status: CaseStatus) {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatPriority(priority: CasePriority) {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export interface CaseListItemProps {
  case_: CaseResponse
  isSelected: boolean
  onSelect: (caseId: string) => void
  showNotes: boolean
  basePath: string
  isStaffOrAdmin: boolean
}

export function CaseListItem({
  case_,
  isSelected,
  onSelect,
  showNotes,
  basePath,
  isStaffOrAdmin
}: CaseListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Handle keyboard interactions
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Space or Enter to toggle selection
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      onSelect(case_.id)
    }
  }, [case_.id, onSelect])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'group relative rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50',
        isSelected && 'border-primary'
      )}
      role="listitem"
      aria-selected={isSelected}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`case-${case_.id}`}
              checked={isSelected}
              onCheckedChange={() => onSelect(case_.id)}
              aria-label={`Select case ${case_.title}`}
            />
            <Link
              href={`${basePath}/${case_.id}`}
              className="font-semibold hover:underline"
              aria-label={`View details for case: ${case_.title}`}
            >
              {case_.title}
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge 
              variant={getStatusVariant(case_.status)}
              aria-label={`Status: ${formatStatus(case_.status)}`}
            >
              {formatStatus(case_.status)}
            </Badge>
            <Badge 
              variant={getPriorityVariant(case_.priority)}
              aria-label={`Priority: ${formatPriority(case_.priority)}`}
            >
              {formatPriority(case_.priority)}
            </Badge>
            <span className="text-sm text-muted-foreground" aria-label={`Created on ${formatDate(case_.created_at)}`}>
              {formatDate(case_.created_at)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2" aria-label="Case description">
            {case_.description}
          </p>
        </div>
        {isStaffOrAdmin && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={`${isExpanded ? 'Hide' : 'Show'} internal notes`}
            aria-expanded={isExpanded}
            aria-controls={`notes-${case_.id}`}
          >
            <StickyNote className="h-4 w-4" />
          </Button>
        )}
      </div>
      <AnimatePresence>
        {isStaffOrAdmin && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
            id={`notes-${case_.id}`}
            role="region"
            aria-label="Internal notes"
          >
            <Separator />
            <div className="space-y-1">
              <h4 className="font-medium">Internal Notes</h4>
              <p className="text-sm text-muted-foreground">
                {case_.internal_notes || 'No internal notes'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 