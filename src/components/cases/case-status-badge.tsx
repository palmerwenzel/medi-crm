import { Badge } from '@/components/ui/badge'
import type { CaseStatus } from '@/types/domain/cases'

const statusColors: Record<CaseStatus, string> = {
  open: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
  in_progress: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  resolved: 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
}

interface CaseStatusBadgeProps {
  status: CaseStatus
}

export function CaseStatusBadge({ status }: CaseStatusBadgeProps) {
  return (
    <Badge 
      variant="secondary"
      className={statusColors[status]}
    >
      {status.replace('_', ' ')}
    </Badge>
  )
} 