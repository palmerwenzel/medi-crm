'use server'

import OpenAI from 'openai'
import { type Message } from '@/types/chat'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

type AIResponse = {
  message: string
  metadata?: {
    triageDecision?: 'EMERGENCY' | 'URGENT' | 'ROUTINE'
    confidenceScore?: number
    extractedData?: Record<string, any>
  }
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
  messages: Message[],
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

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: formattedMessages
    })

    const aiMessage = response.choices[0].message.content || ''

    return {
      success: true,
      data: {
        message: aiMessage,
        metadata: {
          // Add metadata extraction here if needed
        }
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
  decision: 'EMERGENCY' | 'URGENT' | 'ROUTINE'
  confidence: number 
}>> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: 'system',
          content: `You are a medical triage assistant. Based on the conversation, determine the urgency level:
            EMERGENCY: Life-threatening conditions requiring immediate attention
            URGENT: Serious but not immediately life-threatening
            ROUTINE: Can be handled during regular office hours
            
            Respond only with the decision and confidence score in JSON format:
            {"decision": "EMERGENCY|URGENT|ROUTINE", "confidence": 0.0-1.0}`
        },
        ...messages.map(msg => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content
        }))
      ],
      response_format: { type: "json_object" }
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')

    return {
      success: true,
      data: {
        decision: result.decision,
        confidence: result.confidence
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