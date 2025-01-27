import { AlertCircle, Clock, FileText, User, Calendar } from 'lucide-react'
import type { CaseResponse } from '@/types/domain/cases'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'

interface CaseMetadataProps {
  case: CaseResponse
  showAttachments?: boolean
  showAssignedTo?: boolean
  showUpdatedAt?: boolean
  showCreatedAt?: boolean
  showPatient?: boolean
  dateFormat?: 'relative' | 'absolute'
  className?: string
  iconSize?: 'sm' | 'md'
  variant?: 'default' | 'compact'
}

export function CaseMetadata({ 
  case: caseData, 
  showAttachments = true,
  showAssignedTo = false,
  showUpdatedAt = false,
  showCreatedAt = true,
  showPatient = true,
  dateFormat = 'absolute',
  className,
  iconSize = 'sm',
  variant = 'default'
}: CaseMetadataProps) {
  // Format patient name
  const patientName = caseData.patient
    ? `${caseData.patient.first_name || ''} ${caseData.patient.last_name || ''}`.trim()
    : 'Unknown Patient'

  // Format assigned staff name
  const assignedToName = caseData.assigned_to
    ? `${caseData.assigned_to.first_name || ''} ${caseData.assigned_to.last_name || ''}`.trim()
    : 'Unassigned'

  const iconClassName = cn(
    'flex-shrink-0',
    iconSize === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  )

  const containerClassName = cn(
    'flex flex-wrap gap-4 text-sm text-muted-foreground',
    variant === 'compact' && 'gap-2 text-xs',
    className
  )

  return (
    <div className={containerClassName}>
      {showPatient && (
        <div className="flex items-center gap-1">
          <AlertCircle className={iconClassName} />
          <span>Patient: {patientName}</span>
        </div>
      )}
      
      {showCreatedAt && (
        <div className="flex items-center gap-1">
          <Clock className={iconClassName} />
          <span>
            {dateFormat === 'relative' 
              ? `Created ${formatDistanceToNow(new Date(caseData.created_at))} ago`
              : `Created ${format(new Date(caseData.created_at), 'MMM d, yyyy')}`
            }
          </span>
        </div>
      )}

      {showUpdatedAt && caseData.updated_at && (
        <div className="flex items-center gap-1">
          <Calendar className={iconClassName} />
          <span>
            {dateFormat === 'relative'
              ? `Updated ${formatDistanceToNow(new Date(caseData.updated_at))} ago`
              : `Updated ${format(new Date(caseData.updated_at), 'MMM d, yyyy')}`
            }
          </span>
        </div>
      )}

      {showAssignedTo && (
        <div className="flex items-center gap-1">
          <User className={iconClassName} />
          <span>Assigned to: {assignedToName}</span>
        </div>
      )}

      {showAttachments && caseData.attachments && Array.isArray(caseData.attachments) && caseData.attachments.length > 0 && (
        <div className="flex items-center gap-1">
          <FileText className={iconClassName} />
          <span>{caseData.attachments.length} attachments</span>
        </div>
      )}
    </div>
  )
} 