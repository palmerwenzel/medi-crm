'use client'

import { useEffect, useRef } from 'react'
import { UIMessage, TypingStatus } from '@/types/domain/ui'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from '@/components/chat/chat-message'
import { ChatTypingIndicator } from '@/components/chat/chat-typing-indicator'

interface ChatMessagesProps {
  messages: UIMessage[]
  typingUsers: TypingStatus[]
  onMarkAsRead?: (messageId: string) => void
  className?: string
}

export function ChatMessages({
  messages,
  typingUsers,
  onMarkAsRead,
  className
}: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return (
    <ScrollArea className={cn('', className)}>
      <div className="flex flex-col space-y-4 p-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onMarkAsRead={onMarkAsRead}
          />
        ))}
        {typingUsers.length > 0 && (
          <ChatTypingIndicator users={typingUsers} />
        )}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  )
} 