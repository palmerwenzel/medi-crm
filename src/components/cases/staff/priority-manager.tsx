/**
 * PriorityManager Component
 * Handles individual and bulk case priority updates
 * Only accessible to staff and admin roles
 */
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/providers/auth-provider'

type CasePriority = 'low' | 'medium' | 'high' | 'urgent'

const priorityColors: Record<CasePriority, string> = {
  low: 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20',
  medium: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  high: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20',
  urgent: 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
}

interface PriorityManagerProps {
  caseIds: string[]
  currentPriority?: CasePriority
  onUpdate: () => void
  className?: string
}

export function PriorityManager({
  caseIds,
  currentPriority,
  onUpdate,
  className
}: PriorityManagerProps) {
  const { user, userRole } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  // Only staff and admin can access this component
  if (!user || !['staff', 'admin'].includes(userRole || '')) {
    router.push('/dashboard')
    return null
  }

  async function handlePriorityChange(priority: CasePriority) {
    try {
      setIsLoading(true)

      const { error } = await supabase
        .from('cases')
        .update({ priority })
        .in('id', caseIds)

      if (error) throw error

      toast({
        title: 'Priority Updated',
        description: `Successfully updated priority for ${caseIds.length} case(s).`,
      })

      onUpdate()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update priority',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {currentPriority && (
          <Badge 
            variant="secondary"
            className={priorityColors[currentPriority]}
          >
            {currentPriority}
          </Badge>
        )}
        <Select
          disabled={isLoading || caseIds.length === 0}
          onValueChange={(value) => handlePriorityChange(value as CasePriority)}
          defaultValue={currentPriority}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Set priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="urgent">Urgent Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
} 