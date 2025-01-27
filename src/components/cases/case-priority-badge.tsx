import { Badge } from '@/components/ui/badge'
import type { CasePriority } from '@/types/domain/cases'

const priorityColors: Record<CasePriority, string> = {
  low: 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20',
  medium: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  high: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20',
  urgent: 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
}

interface CasePriorityBadgeProps {
  priority: CasePriority
}

export function CasePriorityBadge({ priority }: CasePriorityBadgeProps) {
  return (
    <Badge 
      variant="secondary"
      className={priorityColors[priority]}
    >
      {priority}
    </Badge>
  )
} 