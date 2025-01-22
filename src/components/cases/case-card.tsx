/**
 * Case Card Component
 * Displays individual case information
 */

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { CaseStatusBadge } from './case-status-badge'
import type { CaseResponse } from '@/lib/validations/case'

interface CaseCardProps {
  case: CaseResponse & {
    patient: {
      first_name: string | null
      last_name: string | null
    } | null
  }
}

export function CaseCard({ case: caseData }: CaseCardProps) {
  // Format patient name
  const patientName = caseData.patient
    ? `${caseData.patient.first_name} ${caseData.patient.last_name}`.trim()
    : 'Unknown Patient'

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
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <span>Patient: {patientName}</span>
            <span>Created {formatDistanceToNow(new Date(caseData.created_at))} ago</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
} 