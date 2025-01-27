'use client'

import { TypingStatus } from '@/types/domain/ui'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface ChatTypingIndicatorProps {
  users: TypingStatus[]
  className?: string
}

export function ChatTypingIndicator({
  users,
  className
}: ChatTypingIndicatorProps) {
  if (users.length === 0) return null

  return (
    <Card
      className={cn(
        'flex max-w-[80%] items-center space-x-2 p-4 mr-auto',
        className
      )}
    >
      <div className="flex space-x-1">
        <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/25 [animation-delay:-0.3s]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/25 [animation-delay:-0.15s]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/25" />
      </div>
      <span className="text-xs text-muted-foreground">
        {users.length === 1
          ? 'Someone is typing...'
          : `${users.length} people are typing...`}
      </span>
    </Card>
  )
} 