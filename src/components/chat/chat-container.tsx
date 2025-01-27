'use client'

import { useCallback, useState, useEffect } from 'react'
import { useChat } from '@/hooks/use-chat'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { ChatMessages } from './chat-messages'
import { ChatInput } from './chat-input'
import { ConversationList } from './conversation-list'
import { MessagesSquare } from 'lucide-react'

interface ChatContainerProps {
  patientId: string
  className?: string
}

export function ChatContainer({ 
  patientId,
  className 
}: ChatContainerProps) {
  // Track active conversation ID separately
  const [activeConversationId, setActiveConversationId] = useState<string>()

  const {
    messages,
    conversations,
    isLoading,
    typingUsers,
    sendMessage,
    markAsRead,
    createConversation,
    updateStatus,
    deleteConversation
  } = useChat({ 
    patientId,
    conversationId: activeConversationId
  })

  // Update active conversation when conversations change
  useEffect(() => {
    const activeConv = conversations?.find(c => c.status === 'active')
    if (activeConv?.id && !activeConversationId) {
      setActiveConversationId(activeConv.id)
    }
  }, [conversations, activeConversationId])

  // Convert typingUsers Map to array
  const typingUsersArray = Array.from(typingUsers.values())

  // Wrapper functions to match expected types
  const handleCreateConversation = useCallback(async () => {
    try {
      const conversation = await createConversation()
      return conversation
    } catch (error) {
      console.error('Failed to create conversation:', error)
    }
  }, [createConversation])

  const handleSendMessage = useCallback(async (content: string) => {
    try {
      // If no conversations exist, create one first
      if (!conversations?.length) {
        await handleCreateConversation()
        // The useChat hook will automatically update the conversations list
      }
      await sendMessage(content)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }, [conversations, handleCreateConversation, sendMessage])

  const handleDeleteConversation = useCallback(async (id: string) => {
    try {
      await deleteConversation(id)
      // If we deleted the active conversation, clear it
      if (id === activeConversationId) {
        setActiveConversationId(undefined)
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }, [deleteConversation, activeConversationId])

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-4 gap-4 h-[600px]', className)}>
      {/* Conversation List */}
      <Card className="md:col-span-1 overflow-hidden">
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          isLoading={isLoading}
          onCreateConversation={handleCreateConversation}
          onUpdateStatus={updateStatus}
          onDeleteConversation={handleDeleteConversation}
          setActiveConversationId={setActiveConversationId}
        />
      </Card>

      {/* Chat Area */}
      <Card className="md:col-span-3 flex flex-col overflow-hidden">
        {!activeConversationId && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessagesSquare className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">Welcome to Medical Chat</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              Start a new conversation from the sidebar to begin your medical consultation. Our AI assistant will help gather your information.
            </p>
          </div>
        ) : (
          <>
            <ChatMessages
              messages={messages}
              typingUsers={typingUsersArray}
              onMarkAsRead={markAsRead}
              className="flex-1"
            />
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              className="border-t"
            />
          </>
        )}
      </Card>
    </div>
  )
} 