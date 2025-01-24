// src/types/chat.ts
export interface Message {
    id: string;
    content: string;
    sender: 'user' | 'ai';
  }
  
  export interface ChatRequest {
    messages: {
      role: 'system' | 'user' | 'assistant';
      content: string;
    }[];
  }
  
  export interface ChatResponse {
    message: string;
  }