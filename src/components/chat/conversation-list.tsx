'use client'

import { useState, useRef, useEffect } from 'react'
import { Archive, MessageSquare, Plus, MessagesSquare } from 'lucide-react'
import { type UIMedicalConversation } from '@/types/domain/ui'
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
  conversations: UIMedicalConversation[]
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
  const activeConversationRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Scroll active conversation into view when it changes
  useEffect(() => {
    if (activeId && activeConversationRef.current && scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (!viewport) return

      const cardRect = activeConversationRef.current.getBoundingClientRect()
      const viewportRect = viewport.getBoundingClientRect()

      // Only scroll if the card is outside the viewport
      if (cardRect.top < viewportRect.top || cardRect.bottom > viewportRect.bottom) {
        activeConversationRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        })
      }
    }
  }, [activeId])

  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[64px] w-full" />
        ))}
      </div>
    )
  }

  const hasConversations = conversations.length > 0

  return (
    <div className="flex flex-col h-full">
      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div className="space-y-1 p-4">
          <Button
            variant="outline"
            className="w-full justify-center mb-2"
            onClick={onCreateConversation}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Conversation
          </Button>

          {!hasConversations ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessagesSquare className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-sm font-medium">No conversations yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Start a new conversation to begin your medical consultation.
              </p>
            </div>
          ) : conversations.map((conversation: UIMedicalConversation) => (
            <Card
              key={conversation.id}
              ref={conversation.id === activeId ? activeConversationRef : undefined}
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