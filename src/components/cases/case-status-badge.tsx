import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

type CaseStatus = 'open' | 'in_progress' | 'resolved'

interface CaseStatusBadgeProps {
  status: CaseStatus
  className?: string
}

const statusConfig: Record<CaseStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  open: { label: 'Open', variant: 'default' },
  in_progress: { label: 'In Progress', variant: 'secondary' },
  resolved: { label: 'Resolved', variant: 'outline' },
}

export function CaseStatusBadge({ status, className }: CaseStatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge 
      variant={config.variant}
      className={cn(
        'transition-colors duration-200',
        className
      )}
    >
      {config.label}
    </Badge>
  )
} 