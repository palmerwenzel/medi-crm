/**
 * Handles API interactions for the medical intake chatbot.
 */
import { ChatRequest, ChatResponse } from '@/types/chat';

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  try {
    // Consider using your Supabase client or OpenAI API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return response.json();
  } catch (error) {
    console.error('Chat service error:', error);
    throw error;
  }
}