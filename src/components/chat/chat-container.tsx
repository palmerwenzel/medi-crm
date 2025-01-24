'use client'

import { useCallback, useState, useEffect } from 'react'
import { useChat } from '@/hooks/use-chat'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { ChatMessages } from './chat-messages'
import { ChatInput } from './chat-input'
import { ConversationList } from './conversation-list'

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
    error,
    typingUsers,
    presenceState,
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
      </Card>
    </div>
  )
} 