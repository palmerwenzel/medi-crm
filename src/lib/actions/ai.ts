'use server'

import OpenAI from 'openai'
import { type Message, type TriageDecision, type MessageMetadata } from '@/types/domain/chat'
import type { ExtractedAIData } from '@/types/domain/ai'
import { generateChatResponse, makeTriageDecision as aiMakeTriageDecision, extractStructuredData } from '@/lib/ai/openai'
import { validateMessageMetadata } from '@/lib/validations/message-metadata'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export type AIResult = {
  data: {
    content: string
    metadata: MessageMetadata
  }
  error?: string
}

type AIResponse = {
  message: string
  metadata: MessageMetadata
}

type ActionResponse<T = void> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Processes a message through OpenAI and returns the response with metadata
 */
export async function processAIMessage(
  messages: Array<Message | { role: 'user' | 'assistant'; content: string }>,
  systemPrompt?: string
): Promise<ActionResponse<AIResponse>> {
  try {
    const formattedMessages = [
      // Include system prompt if provided
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      // Include message history
      ...messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      }))
    ]

    const aiMessage = await generateChatResponse(formattedMessages)

    // Extract structured data if available
    let extractedData: ExtractedAIData | undefined
    try {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.role === 'user') {
        extractedData = await extractStructuredData(lastMessage.content)
      }
    } catch (error) {
      console.warn('Non-critical: Failed to extract structured data:', error)
    }

    // Create and validate metadata
    const metadata = validateMessageMetadata({
      type: 'ai_processing',
      collected_info: extractedData,
      triage_decision: undefined // Will be set by makeTriageDecision if needed
    })

    return {
      success: true,
      data: {
        message: aiMessage,
        metadata
      }
    }
  } catch (error) {
    console.error('AI processing error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process message'
    }
  }
}

/**
 * Makes a triage decision based on conversation context
 */
export async function makeTriageDecision(
  messages: Message[]
): Promise<ActionResponse<{ 
  decision: TriageDecision
  confidence: number 
}>> {
  try {
    const { decision, confidence } = await aiMakeTriageDecision(messages)
    
    return {
      success: true,
      data: {
        decision,
        confidence
      }
    }
  } catch (error) {
    console.error('Triage decision error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to make triage decision'
    }
  }
} 