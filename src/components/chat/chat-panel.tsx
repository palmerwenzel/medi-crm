'use client'

import { useEffect, useRef } from 'react'
import { useChat } from '@/hooks/use-chat'
import { ChatMessages } from './chat-messages'
import { ChatInput } from './chat-input'
import { ChatActions } from './chat-actions'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { updateChatStatus } from '@/lib/services/chat-service'
import { useAuth } from '@/providers/auth-provider'

interface ChatPanelProps {
  caseId: string
  patientId: string
  className?: string
}

export function ChatPanel({
  caseId,
  patientId,
  className
}: ChatPanelProps) {
  const { toast } = useToast()
  const { userRole } = useAuth()
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const {
    messages,
    isLoading,
    error,
    typingUsers,
    sendMessage,
    sendTyping,
    markAsRead
  } = useChat({
    patientId,
    conversationId: caseId,
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Chat Error",
        description: error.message || "Failed to perform chat operation"
      })
    }
  })

  // Update chat status when messages change
  useEffect(() => {
    if (!messages.length || !userRole) return

    const lastMessage = messages[messages.length - 1]
    const isAssistantMessage = lastMessage.role === 'assistant'
    const isUserMessage = lastMessage.role === 'user'

    // Only update status if we're staff or the last message was from the user
    if (userRole === 'staff' || isUserMessage) {
      try {
        updateChatStatus(
          caseId,
          isAssistantMessage ? 'completed' : 'needs_response'
        )
      } catch (err) {
        console.error('Failed to update chat status:', err)
      }
    }
  }, [messages, caseId, userRole])

  // Mark chat as active when provider views it
  useEffect(() => {
    if (userRole === 'staff') {
      try {
        updateChatStatus(caseId, 'active')
      } catch (err) {
        console.error('Failed to update chat status:', err)
      }
    }
  }, [caseId, userRole])

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle any uncaught errors
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Chat Error",
        description: error.message || "Failed to load chat messages"
      })
    }
  }, [error, toast])

  // Cleanup typing indicator on unmount
  useEffect(() => {
    const timeoutRef = typingTimeoutRef.current
    
    return () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef)
      }
      // Ensure typing indicator is turned off when component unmounts
      if (caseId) {
        sendTyping(false)
      }
    }
  }, [caseId, sendTyping])

  if (isLoading) {
    return (
      <div className={cn("space-y-4 p-4", className)}>
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[100px]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("p-4 text-center text-muted-foreground", className)}>
        Failed to load chat. Please try again later.
      </div>
    )
  }

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content)
      scrollToBottom()
      
      // Update chat status after sending message
      if (userRole === 'staff') {
        await updateChatStatus(caseId, 'completed')
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to Send",
        description: "Your message could not be sent. Please try again."
      })
    }
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex-1">
        <ChatMessages
          messages={messages}
          typingUsers={Array.from(typingUsers.values())}
          onMarkAsRead={markAsRead}
        />
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t">
        <ChatInput
          onSendMessage={handleSendMessage}
          onTyping={sendTyping}
          isLoading={isLoading}
        />
      </div>

      <div className="border-t p-4">
        <ChatActions
          conversationId={caseId}
          messages={messages}
          metadata={messages[messages.length - 1]?.metadata || {}}
          patientId={patientId}
        />
      </div>
    </div>
  )
} 