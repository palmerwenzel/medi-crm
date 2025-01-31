/**
 * Server actions for medical chat system
 * Access control handled by RLS policies
 */
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { 
  type Message,
  type Conversation,
  messageInsertSchema,
  conversationInsertSchema,
  messageQuerySchema,
  conversationQuerySchema
} from '@/lib/validations/chat'
import type { MessageMetadata, MessageInsert, ConversationInsert } from '@/types/domain/chat'

type ActionResponse<T = void> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Creates a new medical conversation
 */
export async function createConversation(
  patientId: string
): Promise<ActionResponse<Conversation>> {
  try {
    const supabase = await createClient()
    
    const newConversation: ConversationInsert = {
      patient_id: patientId,
      status: 'active',
      metadata: {},
      access: { can_access: 'ai' }
    }

    const { data, error } = await supabase
      .from('medical_conversations')
      .insert(conversationInsertSchema.parse(newConversation))
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Failed to create conversation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create conversation'
    }
  }
}

/**
 * Sends a new message in a conversation
 */
export async function sendMessage(
  content: string,
  conversationId: string,
  role: 'user' | 'assistant' = 'user',
  metadata: MessageMetadata = { type: 'standard' }
): Promise<ActionResponse<Message>> {
  try {
    const supabase = await createClient()
    
    const newMessage: MessageInsert = {
      conversation_id: conversationId,
      content,
      role,
      metadata
    }

    const { data, error } = await supabase
      .from('medical_messages')
      .insert(messageInsertSchema.parse(newMessage))
      .select()
      .single()

    if (error) throw error

    revalidatePath(`/chat/${conversationId}`)

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Failed to send message:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message'
    }
  }
}

/**
 * Fetches messages for a conversation with pagination
 */
export async function getMessages(
  conversationId: string,
  page = 1,
  limit = 20
): Promise<ActionResponse<Message[]>> {
  try {
    const supabase = await createClient()
    
    const query = messageQuerySchema.parse({ conversation_id: conversationId, page, limit })
    const from = (query.page - 1) * query.limit
    const to = from + query.limit - 1

    const { data, error } = await supabase
      .from('medical_messages')
      .select()
      .eq('conversation_id', query.conversation_id)
      .order('created_at', { ascending: true })
      .range(from, to)

    if (error) throw error

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch messages'
    }
  }
}

/**
 * Updates a conversation's status
 */
export async function updateConversationStatus(
  conversationId: string,
  status: 'active' | 'archived'
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('medical_conversations')
      .update({ status })
      .eq('id', conversationId)

    if (error) throw error

    revalidatePath(`/chat/${conversationId}`)

    return { success: true }
  } catch (error) {
    console.error('Failed to update conversation status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update conversation status'
    }
  }
}

/**
 * Fetches conversations for a patient with pagination
 */
export async function getConversations(
  patientId: string,
  page = 1,
  limit = 20,
  status?: 'active' | 'archived'
): Promise<ActionResponse<Conversation[]>> {
  try {
    const supabase = await createClient()
    
    const query = conversationQuerySchema.parse({ page, limit, status })
    const from = (query.page - 1) * query.limit
    const to = from + query.limit - 1

    let queryBuilder = supabase
      .from('medical_conversations')
      .select()
      .eq('patient_id', patientId)
      .order('updated_at', { ascending: false })
      .range(from, to)

    if (status) {
      queryBuilder = queryBuilder.eq('status', status)
    }

    const { data, error } = await queryBuilder

    // If no data found, return empty array instead of error
    if (!data || data.length === 0) {
      return {
        success: true,
        data: []
      }
    }

    if (error) throw error

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Failed to fetch conversations:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch conversations'
    }
  }
}

/**
 * Deletes a conversation and its messages
 */
export async function deleteConversation(conversationId: string) {
  try {
    const supabase = await createClient()

    console.log('Starting deletion process for conversation:', conversationId)

    // Delete all messages first (due to foreign key constraint)
    const { data: deletedMessages, error: messagesError } = await supabase
      .from('medical_messages')
      .delete()
      .eq('conversation_id', conversationId)
      .select()

    if (messagesError) {
      console.error('Failed to delete messages:', messagesError)
      return { success: false, error: 'Failed to delete messages' }
    }

    console.log('Successfully deleted messages:', deletedMessages?.length || 0)

    // Then delete the conversation
    const { data: deletedConversation, error: conversationError } = await supabase
      .from('medical_conversations')
      .delete()
      .eq('id', conversationId)
      .select()
      .single()

    if (conversationError) {
      console.error('Failed to delete conversation:', conversationError)
      return { success: false, error: 'Failed to delete conversation' }
    }

    console.log('Successfully deleted conversation:', deletedConversation)

    return { success: true, data: { deletedConversation, deletedMessages } }
  } catch (error) {
    console.error('Delete conversation error:', error)
    return { success: false, error: 'Failed to delete conversation' }
  }
} 