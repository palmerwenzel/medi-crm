'use client'

import { useEffect } from 'react'
import { UIMessage } from '@/types/chat'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Check, CheckCheck } from 'lucide-react'

interface ChatMessageProps {
  message: UIMessage
  onMarkAsRead?: (messageId: string) => void
  className?: string
}

export function ChatMessage({
  message,
  onMarkAsRead,
  className
}: ChatMessageProps) {
  const isUser = message.role === 'user'
  const status = message.metadata?.status

  // Mark message as read when it appears
  useEffect(() => {
    if (
      !isUser && 
      status === 'delivered' && 
      onMarkAsRead
    ) {
      onMarkAsRead(message.id)
    }
  }, [isUser, status, message.id, onMarkAsRead])

  return (
    <Card
      className={cn(
        'flex max-w-[80%] items-start space-x-2 p-4',
        isUser ? 'ml-auto bg-primary text-primary-foreground' : 'mr-auto',
        className
      )}
    >
      <div className="flex-1">
        <p className="text-sm">{message.content}</p>
      </div>
      {isUser && status && (
        <div className="ml-2 flex items-center text-xs text-muted-foreground">
          {status === 'delivered' && <Check className="h-3 w-3" />}
          {status === 'read' && <CheckCheck className="h-3 w-3" />}
        </div>
      )}
    </Card>
  )
} 