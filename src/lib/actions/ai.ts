'use server'

import OpenAI from 'openai'
import { type Message, type TriageDecision, type MessageMetadata } from '@/types/domain/chat'
import type { ExtractedAIData } from '@/types/domain/ai'
import {
  generateChatResponse,
  generateClinicalInterviewResponse,
  makeTriageDecision as aiMakeTriageDecision,
  extractStructuredData
} from '@/lib/ai/openai'
import { validateMessageMetadata } from '@/lib/validations/message-metadata'

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
 * Processes a generic message through OpenAI and returns the response with metadata.
 * Useful for non-medical queries or simpler tasks.
 */
export async function processAIMessage(
  messages: Array<Message | { role: 'user' | 'assistant'; content: string }>,
  systemPrompt?: string
): Promise<ActionResponse<AIResponse>> {
  try {
    const formattedMessages = [
      // Optional system prompt, e.g., if you want a special role or style.
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      // Message history
      ...messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      }))
    ]

    const aiMessage = await generateChatResponse(formattedMessages)

    const metadata = validateMessageMetadata({
      type: 'ai_processing',
      collected_info: undefined,
      triage_decision: undefined
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
 * Initiates or continues a standard 'clinical interview' style conversation.
 * This uses generateClinicalInterviewResponse.
 */
export async function processClinicalInterviewMessage(
  messages: Array<Message>
): Promise<ActionResponse<AIResponse>> {
  try {
    const aiMessage = await generateClinicalInterviewResponse(messages)

    const metadata = validateMessageMetadata({
      type: 'ai_processing',
      collected_info: undefined,
      triage_decision: undefined
    })

    return {
      success: true,
      data: {
        message: aiMessage,
        metadata
      }
    }
  } catch (error) {
    console.error('Clinical interview error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process clinical interview'
    }
  }
}

/**
 * Makes a triage decision based on conversation context.
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

/**
 * Extracts structured medical data from user content.
 */
export async function extractMedicalInformation(
  content: string
): Promise<ActionResponse<ExtractedAIData>> {
  try {
    const data = await extractStructuredData(content)
    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Medical extraction error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract medical data'
    }
  }
} 