import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { CaseStatusBadge } from './case-status-badge'
import type { CaseResponse } from '@/lib/validations/case'

interface CaseCardProps {
  case: CaseResponse
}

export function CaseCard({ case: caseData }: CaseCardProps) {
  return (
    <Link 
      href={`/patient/cases/${caseData.id}`}
      className="block transition-opacity hover:opacity-80"
    >
      <Card className="h-full backdrop-blur-[2px] hover:bg-card/80 transition-colors duration-200">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="line-clamp-1">{caseData.title}</CardTitle>
            <CaseStatusBadge status={caseData.status} />
          </div>
          <CardDescription className="line-clamp-2">
            {caseData.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Created {formatDistanceToNow(new Date(caseData.created_at))} ago
          </div>
        </CardContent>
      </Card>
    </Link>
  )
} 