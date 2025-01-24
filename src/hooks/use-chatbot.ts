'use client';

/**
 * Custom hook for managing medical intake chatbot state and interactions.
 */
import { useState } from 'react';
import { Message, ChatRequest } from '@/types/chat';
import { sendChatMessage } from '@/lib/services/chat-service';

const SYSTEM_PROMPT = `You are a compassionate medical intake assistant designed to help patients 
provide preliminary medical information...`;

export function useChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (userMessage: string) => {
    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      content: userMessage,
      sender: 'user'
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const chatRequest: ChatRequest = {
        messages: [
          { role: 'system', content: SYSTEM_PROMPT } as const,
          ...messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
          }) satisfies { role: 'user' | 'assistant', content: string }),
          { role: 'user', content: userMessage } as const
        ]
      };

      const response = await sendChatMessage(chatRequest);

      const newAiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: response.message,
        sender: 'ai'
      };

      setMessages(prev => [...prev, newAiMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        content: 'Sorry, there was an error processing your message.',
        sender: 'ai'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, sendMessage };
}