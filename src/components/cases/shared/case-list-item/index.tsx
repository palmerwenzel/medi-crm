'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageSquare, UserPlus2 } from 'lucide-react'
import { CaseStatusBadge } from '@/components/cases/case-status-badge'
import { CaseMetadata } from '@/components/cases/case-metadata'
import { SLAIndicator } from '../sla-indicator'
import { cn } from '@/lib/utils'
import { priorityColors } from '@/lib/utils/case-formatting'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/utils/supabase/client'
import type { CasesRow } from '@/lib/validations/cases'
import type { CasePriority, ConversationStatus } from '@/types/domain/cases'

interface CaseListItemProps {
  case_: CasesRow & {
    metadata?: {
      sla?: {
        response_target: string
        resolution_target: string
        last_updated: string
      }
      tags?: string[]
      internal_notes?: string
      specialties?: string[]
      chat_status?: ConversationStatus
    }
  }
  isSelected?: boolean
  onSelect?: (id: string) => void
  showNotes?: boolean
  basePath?: string
  isStaffOrAdmin?: boolean
  className?: string
}

const chatStatusColors = {
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  archived: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
} as const

const supabase = createClient()

/**
 * Claims a case and assigns it to the current staff member
 * @throws {Error} If no user is authenticated or if case is already assigned
 */
async function claimCase(caseId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No authenticated user')

  const { error } = await supabase.rpc('claim_case', {
    case_id: caseId,
    staff_id: user.id
  })

  if (error) {
    if (error.message.includes('already assigned')) {
      throw new Error('Case is already assigned to another staff member')
    }
    throw error
  }
}

export function CaseListItem({
  case_,
  isSelected,
  onSelect,
  showNotes = false,
  basePath = '/cases',
  isStaffOrAdmin = false,
  className
}: CaseListItemProps) {
  const { toast } = useToast()
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect?.(case_.id)
    }
  }, [case_.id, onSelect])

  const handleClaim = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await claimCase(case_.id)
      toast({
        title: 'Case claimed',
        description: 'You have successfully claimed this case.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to claim case',
        variant: 'destructive',
      })
    }
  }, [case_.id, toast])

  return (
    <div 
      className={cn('group relative', className)}
    >
      <div className="flex items-start gap-2">
        {onSelect && (
          <div className="pt-4">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(case_.id)}
              aria-label={`Select case ${case_.title}`}
              onKeyDown={handleKeyDown}
            />
          </div>
        )}
        <div className="flex-1">
          <Link href={`${basePath}/${case_.id}`}>
            <Card className={cn(
              'relative overflow-hidden border bg-background/95 p-6 backdrop-blur transition-colors duration-200',
              'glass-sm-hover supports-[backdrop-filter]:bg-background/60',
              isSelected && 'border-primary'
            )}>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold">{case_.title}</h3>
                  <CaseStatusBadge status={case_.status} />
                  {case_.priority && (
                    <Badge variant="outline" className={cn('border', priorityColors[case_.priority as CasePriority])}>
                      {case_.priority}
                    </Badge>
                  )}
                  {case_.metadata?.chat_status && (
                    <Badge variant="outline" className={cn(chatStatusColors[case_.metadata.chat_status as keyof typeof chatStatusColors])}>
                      {case_.metadata.chat_status.replace('_', ' ')}
                    </Badge>
                  )}
                  {case_.metadata?.sla && (
                    <SLAIndicator sla={case_.metadata.sla} />
                  )}
                  {case_.metadata?.specialties && case_.metadata.specialties.length > 0 && (
                    <div className="flex gap-1">
                      {case_.metadata.specialties.map((specialty: string) => (
                        <Badge key={specialty} variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                          {specialty.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {case_.metadata?.tags && case_.metadata.tags.length > 0 && (
                    <div className="flex gap-1">
                      {case_.metadata.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="ml-auto flex gap-2">
                    {isStaffOrAdmin && !case_.assigned_to && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-2"
                        onClick={handleClaim}
                      >
                        <UserPlus2 className="h-4 w-4" />
                        Claim Case
                      </Button>
                    )}
                    {isStaffOrAdmin && (
                      <Link 
                        href={`${basePath}/${case_.id}?panel=chat`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={cn(
                            "gap-2",
                            case_.metadata?.chat_status === 'active' && "border-green-500 text-green-500 hover:bg-green-500/10"
                          )}
                        >
                          <MessageSquare className="h-4 w-4" />
                          {case_.metadata?.chat_status === 'active' ? 'Active Chat' : 'View Chat'}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {case_.description}
                </p>
                <CaseMetadata 
                  case={case_}
                  showAttachments={true}
                  showAssignedTo={isStaffOrAdmin}
                  showCreatedAt={true}
                  showPatient={true}
                  dateFormat="relative"
                  variant="compact"
                  iconSize="sm"
                />
                {showNotes && case_.metadata?.internal_notes && (
                  <div className="mt-2 text-sm font-medium text-foreground">
                    Notes: {case_.metadata.internal_notes}
                  </div>
                )}
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
} 