'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Archive, MessageSquare, Plus } from 'lucide-react'
import { type MedicalConversationWithMessages } from '@/types/chat'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ConversationListProps {
  conversations: MedicalConversationWithMessages[]
  activeId?: string
  isLoading?: boolean
  onCreateConversation?: () => void
  onUpdateStatus?: (id: string, status: 'active' | 'archived') => void
  onDeleteConversation?: (id: string) => void
  className?: string
  setActiveConversationId?: (id: string) => void
}

export function ConversationList({
  conversations,
  activeId,
  isLoading,
  onCreateConversation,
  onUpdateStatus,
  onDeleteConversation,
  className,
  setActiveConversationId
}: ConversationListProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[64px] w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-4">
        <Button
        variant="outline"
        className="w-full justify-center mb-2"
        onClick={onCreateConversation}
      >
        <Plus className="mr-2 h-4 w-4" />
        New Conversation
      </Button>
          {conversations.map((conversation: MedicalConversationWithMessages) => (
            <Card
              key={conversation.id}
              className={cn(
                'flex items-center justify-between p-3 transition-colors hover:bg-accent',
                activeId === conversation.id && 'bg-accent',
                conversation.status === 'archived' && 'opacity-70'
              )}
              role="button"
              onClick={() => setActiveConversationId?.(conversation.id)}
              onMouseEnter={() => setHoveredId(conversation.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <MessageSquare className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {conversation.topic || 'Medical Consultation'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {new Date(conversation.updated_at || conversation.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {(hoveredId === conversation.id || activeId === conversation.id) && (onUpdateStatus || onDeleteConversation) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0 ml-2">
                      <Archive className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onUpdateStatus && (
                      <DropdownMenuItem
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation()
                          onUpdateStatus(
                            conversation.id,
                            conversation.status === 'active' ? 'archived' : 'active'
                          )
                        }}
                      >
                        {conversation.status === 'active' ? 'Archive' : 'Activate'}
                      </DropdownMenuItem>
                    )}
                    {onDeleteConversation && (
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation()
                          onDeleteConversation(conversation.id)
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
} 