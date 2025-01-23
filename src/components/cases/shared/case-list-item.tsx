import { Card, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CaseStatusBadge } from '@/components/cases/case-status-badge'
import { CasePriorityBadge } from '@/components/cases/case-priority-badge'
import { CaseMetadata } from '@/components/cases/case-metadata'
import { InternalNotesEditor } from '../staff/internal-notes-editor'
import type { CaseResponse } from '@/lib/validations/case'

interface CaseListItemProps {
  case_: CaseResponse
  isSelected: boolean
  onSelect: (id: string) => void
  showNotes: boolean
  onToggleNotes: () => void
  basePath: string
  isStaffOrAdmin: boolean
}

export function CaseListItem({
  case_,
  isSelected,
  onSelect,
  showNotes,
  onToggleNotes,
  basePath,
  isStaffOrAdmin
}: CaseListItemProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(case_.id)}
          aria-label={`Select case ${case_.title}`}
        />
        <Link href={`${basePath}/${case_.id}`} className="flex-1">
          <Card className="hover:bg-accent/5 transition-colors">
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{case_.title}</h3>
                    <CaseStatusBadge status={case_.status} />
                    {case_.priority === 'high' || case_.priority === 'urgent' ? (
                      <CasePriorityBadge priority={case_.priority} />
                    ) : null}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {case_.description?.slice(0, 100)}...
                  </p>

                  <CaseMetadata case={case_} />
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Show internal notes for staff/admin when case is expanded */}
      {isStaffOrAdmin && showNotes && (
        <div className="pl-8">
          <InternalNotesEditor
            caseId={case_.id}
          />
        </div>
      )}

      {/* Toggle notes button for staff/admin */}
      {isStaffOrAdmin && (
        <div className="pl-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleNotes}
          >
            {showNotes ? 'Hide Notes' : 'Show Notes'}
          </Button>
        </div>
      )}
    </div>
  )
} 