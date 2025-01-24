// src/types/chat.ts
import { Database } from './supabase'

type Tables = Database['public']['Tables']

// Base database types
export type MedicalMessage = Tables['medical_messages']['Row']
export type MedicalMessageInsert = Tables['medical_messages']['Insert']
export type MedicalMessageUpdate = Tables['medical_messages']['Update']

export type MedicalConversation = Tables['medical_conversations']['Row']
export type MedicalConversationInsert = Tables['medical_conversations']['Insert']
export type MedicalConversationUpdate = Tables['medical_conversations']['Update']

// Extended types for the UI
export interface MedicalConversationWithMessages extends MedicalConversation {
  messages?: MedicalMessage[]
  unread_count?: number
}

// Discriminated union for message states
export type MessageState = 
  | { status: 'sending'; tempId: string }
  | { status: 'sent'; id: string }
  | { status: 'error'; error: string }

// UI-specific message type
export interface UIMessage extends MedicalMessage {
  state: MessageState
  metadata: {
    status?: 'sending' | 'delivered' | 'read' | 'error'
    [key: string]: any
  }
}

// Real-time types
export type TypingStatus = {
  conversationId: string
  userId: string
  isTyping: boolean
  timestamp: string
}

export type MessageStatus = {
  messageId: string
  status: 'delivered' | 'read'
}

export type PresenceState = {
  [key: string]: {
    user_id: string
    online_at: string
  }[]
}

// OpenAI chat types
export interface ChatRequest {
  messages: {
    role: 'system' | 'user' | 'assistant'
    content: string
  }[]
}

export interface ChatResponse {
  message: string
}