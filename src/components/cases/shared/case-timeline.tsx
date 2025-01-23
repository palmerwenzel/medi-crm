/**
 * Case Timeline Component
 * Displays a chronological view of case history with activity details
 */
'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  AlertCircle,
  ArrowUpDown,
  Calendar,
  FileText,
  Folder,
  LayoutDashboard,
  MessageSquare,
  UserCog,
  Users
} from 'lucide-react'
import type { CaseHistoryResponse, CaseActivityType } from '@/lib/validations/case-history'

interface CaseTimelineProps {
  history: CaseHistoryResponse[]
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
  className?: string
}

// Activity type icons and colors
const activityConfig: Record<CaseActivityType, { icon: React.ReactNode; color: string }> = {
  status_change: { 
    icon: <LayoutDashboard className="h-4 w-4" />, 
    color: 'bg-blue-500/10 text-blue-500'
  },
  priority_change: { 
    icon: <AlertCircle className="h-4 w-4" />, 
    color: 'bg-orange-500/10 text-orange-500'
  },
  category_change: { 
    icon: <Folder className="h-4 w-4" />, 
    color: 'bg-purple-500/10 text-purple-500'
  },
  department_change: { 
    icon: <Users className="h-4 w-4" />, 
    color: 'bg-green-500/10 text-green-500'
  },
  assignment_change: { 
    icon: <UserCog className="h-4 w-4" />, 
    color: 'bg-yellow-500/10 text-yellow-500'
  },
  note_added: { 
    icon: <MessageSquare className="h-4 w-4" />, 
    color: 'bg-indigo-500/10 text-indigo-500'
  },
  file_added: { 
    icon: <FileText className="h-4 w-4" />, 
    color: 'bg-emerald-500/10 text-emerald-500'
  },
  file_removed: { 
    icon: <FileText className="h-4 w-4" />, 
    color: 'bg-red-500/10 text-red-500'
  },
  metadata_change: { 
    icon: <ArrowUpDown className="h-4 w-4" />, 
    color: 'bg-gray-500/10 text-gray-500'
  }
}

// Loading skeleton for timeline items
function TimelineItemSkeleton() {
  return (
    <div className="flex gap-4 pb-8">
      <div className="flex flex-col items-center">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-full w-px bg-border" />
      </div>
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

// Format activity details based on type
function formatActivityDetails(entry: CaseHistoryResponse) {
  const { activity_type, old_value, new_value, actor } = entry
  const actorName = `${actor.first_name || ''} ${actor.last_name || ''}`.trim() || actor.role

  switch (activity_type as CaseActivityType) {
    case 'status_change':
      return `${actorName} changed status from ${old_value?.status || 'none'} to ${new_value?.status}`
    case 'priority_change':
      return `${actorName} changed priority from ${old_value?.priority || 'none'} to ${new_value?.priority}`
    case 'category_change':
      return `${actorName} changed category from ${old_value?.category || 'none'} to ${new_value?.category}`
    case 'department_change':
      return `${actorName} moved case from ${old_value?.department || 'none'} to ${new_value?.department}`
    case 'assignment_change':
      return `${actorName} ${new_value?.assigned_to ? 'assigned case to' : 'unassigned case from'} ${new_value?.assigned_to || old_value?.assigned_to}`
    case 'note_added':
      return `${actorName} added a note: ${new_value?.note}`
    case 'file_added':
      const addedFiles = new_value?.attachments?.length - (old_value?.attachments?.length || 0)
      return `${actorName} added ${addedFiles} file${addedFiles > 1 ? 's' : ''}`
    case 'file_removed':
      const removedFiles = (old_value?.attachments?.length || 0) - (new_value?.attachments?.length || 0)
      return `${actorName} removed ${removedFiles} file${removedFiles > 1 ? 's' : ''}`
    case 'metadata_change':
      return `${actorName} updated case metadata`
    default:
      return 'Unknown activity'
  }
}

export function CaseTimeline({ 
  history, 
  isLoading, 
  hasMore, 
  onLoadMore,
  className 
}: CaseTimelineProps) {
  // Group history entries by date
  const groupedHistory = useMemo(() => {
    const groups = new Map<string, CaseHistoryResponse[]>()
    
    history.forEach(entry => {
      const date = format(new Date(entry.created_at), 'yyyy-MM-dd')
      const group = groups.get(date) || []
      group.push(entry)
      groups.set(date, group)
    })

    return Array.from(groups.entries()).map(([date, entries]) => ({
      date,
      entries: entries.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    }))
  }, [history])

  if (isLoading) {
    return (
      <div className={cn('space-y-8', className)} role="status" aria-label="Loading timeline">
        <TimelineItemSkeleton />
        <TimelineItemSkeleton />
        <TimelineItemSkeleton />
      </div>
    )
  }

  if (!history.length) {
    return (
      <div 
        className={cn('flex items-center justify-center py-8', className)}
        role="status"
        aria-label="No history available"
      >
        <div className="text-center text-muted-foreground">
          <Calendar className="mx-auto h-8 w-8 opacity-50" />
          <p className="mt-2">No history available</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className={cn('pr-4', className)}>
      <div className="space-y-8">
        {groupedHistory.map(({ date, entries }) => (
          <div key={date} className="space-y-4">
            <div className="sticky top-0 z-20 bg-background/95 py-2 backdrop-blur">
              <h3 className="text-sm font-medium text-muted-foreground">
                {format(new Date(date), 'MMMM d, yyyy')}
              </h3>
            </div>

            {entries.map(entry => {
              const config = activityConfig[entry.activity_type as CaseActivityType]
              return (
                <div key={entry.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={cn('rounded-full p-2', config.color)}>
                      {config.icon}
                    </div>
                    <div className="h-full w-px bg-border" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {formatActivityDetails(entry)}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {format(new Date(entry.created_at), 'h:mm a')}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {hasMore && (
          <div className="flex justify-center pt-4">
            <Button 
              variant="outline" 
              onClick={onLoadMore}
              className="w-full"
            >
              Load More
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  )
} 