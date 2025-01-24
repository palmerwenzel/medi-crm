'use client';

/**
 * Custom hook for managing medical intake chatbot state and interactions.
 */
import { useState, useCallback } from 'react';
import { ChatRequest } from '@/types/chat';
import { useChat } from './use-chat';

const SYSTEM_PROMPT = `You are a compassionate medical intake assistant designed to help patients provide preliminary medical information. Your role is to:
1. Gather relevant medical history, symptoms, and concerns from patients
2. Ask follow-up questions to clarify medical information when needed
3. Provide empathetic responses while maintaining professional medical communication
4. Guide patients through the intake process step by step
5. Escalate to human medical staff when necessary
6. Respect patient privacy and maintain medical confidentiality

Remember to:
- Use clear, patient-friendly medical terminology
- Show empathy while maintaining professional boundaries
- Ask one question at a time to avoid overwhelming patients
- Acknowledge patient concerns and validate their experiences
- Flag any urgent medical concerns for immediate staff attention
- Maintain HIPAA-compliant communication standards`;

interface UseChatbotOptions {
  conversationId: string;
  onError?: (error: Error) => void;
}

export function useChatbot({ conversationId, onError }: UseChatbotOptions) {
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    messages,
    isLoading,
    error,
    typingUsers,
    presenceState,
    sendMessage,
    sendTyping,
    markAsRead
  } = useChat({ conversationId, onError });

  const handleSendMessage = useCallback(async (userMessage: string) => {
    try {
      setIsProcessing(true);
      sendTyping(true);

      // Send user message
      await sendMessage(userMessage);

      // The AI response will be handled asynchronously by the messages route
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to process message');
      onError?.(error);
    } finally {
      setIsProcessing(false);
      sendTyping(false);
    }
  }, [sendMessage, sendTyping, onError]);

  return {
    messages,
    isLoading: isLoading || isProcessing,
    error,
    typingUsers,
    presenceState,
    sendMessage: handleSendMessage,
    markAsRead
  };
}