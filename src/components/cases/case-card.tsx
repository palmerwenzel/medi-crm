/**
 * Case Card Component
 * Displays individual case information with role-based actions
 */

'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CaseStatusBadge } from './case-status-badge'
import { CaseMetadata } from './case-metadata'
import { useAuth } from '@/providers/auth-provider'
import type { CaseResponse } from '@/types/domain/cases'

interface CaseCardProps {
  case: CaseResponse
}

export function CaseCard({ case: caseData }: CaseCardProps) {
  const { userRole } = useAuth()

  // Determine case URL based on role
  const caseUrl = `/cases/${caseData.id}`

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
        <CaseMetadata 
          case={caseData}
          showAttachments={true}
          showAssignedTo={showAssignButton}
          showCreatedAt={true}
        />
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {showUpdateButton && (
          <Button variant="outline" asChild>
            <Link href={`${caseUrl}/edit`}>Update</Link>
          </Button>
        )}
        <Button asChild>
          <Link href={caseUrl}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
} 