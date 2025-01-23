/**
 * Case Card Component
 * Displays individual case information with role-based actions
 */

'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CaseStatusBadge } from './case-status-badge'
import { useAuth } from '@/providers/auth-provider'
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
  const { userRole } = useAuth()
  
  // Format patient name
  const patientName = caseData.patient
    ? `${caseData.patient.first_name} ${caseData.patient.last_name}`.trim()
    : 'Unknown Patient'

  // Determine case URL based on role
  const caseUrl = userRole === 'patient' 
    ? `/dashboard/cases/${caseData.id}`
    : `/cases/${caseData.id}`

  // Determine what actions to show based on role
  const showAssignButton = userRole === 'staff' || userRole === 'admin'
  const showUpdateButton = userRole === 'staff' || userRole === 'admin'

  return (
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
      <CardFooter className="flex justify-between">
        <Link href={caseUrl}>
          <Button variant="ghost">View Details</Button>
        </Link>
        {showAssignButton && (
          <Button variant="outline">Assign</Button>
        )}
        {showUpdateButton && (
          <Button variant="outline">Update Status</Button>
        )}
      </CardFooter>
    </Card>
  )
} 