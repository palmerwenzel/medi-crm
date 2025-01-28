/**
 * API route for conversation messages
 */
import { NextRequest, NextResponse } from 'next/server'
import { getMessages, sendMessage } from '@/lib/actions/chat'
import { processAIMessage } from '@/lib/actions/ai'
import { medicalMessagesInsertSchema } from '@/lib/validations/medical-messages'
import { MEDICAL_INTAKE_PROMPT } from '@/lib/ai/prompts'
import { rawToUserIdSchema } from '@/lib/validations/shared-schemas'
import type { Message, MessageMetadata } from '@/types/domain/chat'

export async function GET(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const query = {
      conversation_id: params.conversationId,
      page,
      limit
    }

    const result = await getMessages(
      query.conversation_id,
      query.page,
      query.limit
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to fetch messages' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data || []
    })
  } catch (error) {
    console.error('Messages API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const body = await req.json()
    const { content, role, metadata } = body

    // Transform any raw IDs to branded types
    const transformedMetadata = metadata?.type === 'handoff' 
      ? { 
          ...metadata,
          provider_id: rawToUserIdSchema.parse(metadata.provider_id)
        }
      : metadata

    // Validate and store user message
    const message = medicalMessagesInsertSchema.parse({
      conversation_id: params.conversationId,
      content,
      role: role || 'user',
      metadata: transformedMetadata || {}
    })

    const userResult = await sendMessage(
      message.content, 
      message.conversation_id, 
      message.role,
      message.metadata
    )

    if (!userResult.success) {
      return NextResponse.json(
        { success: false, error: userResult.error || 'Failed to send message' },
        { status: 400 }
      )
    }

    // Return user message with success wrapper
    const response = NextResponse.json({
      success: true,
      data: userResult.data
    })

    // Get AI response if metadata indicates AI processing
    if (metadata?.type === 'ai_processing') {
      const aiPromise = (async () => {
        try {
          // Get previous messages for context
          const history = await getMessages(message.conversation_id, 1, 10)
          if (!history.success || !history.data) throw new Error('Failed to get message history')

          // Filter messages to only include user and assistant roles and cast types
          const messages: Message[] = history.data
            .filter(msg => msg.role === 'user' || msg.role === 'assistant')
            .map(msg => ({
              ...msg,
              role: msg.role as 'user' | 'assistant',
              metadata: msg.metadata as MessageMetadata
            }))
          const aiResult = await processAIMessage(messages, MEDICAL_INTAKE_PROMPT)
          
          if (!aiResult.success || !aiResult.data) throw new Error(aiResult.error || 'AI processing failed')

          // Store AI response with metadata
          await sendMessage(
            aiResult.data.message,
            message.conversation_id,
            'assistant',
            {
              type: 'ai_processing' as const,
              status: 'delivered',
              confidence_score: aiResult.data.metadata?.confidence_score,
              collected_info: {
                urgency_indicators: [],
                ...(aiResult.data.metadata?.extractedData || {})
              }
            } satisfies MessageMetadata
          )
        } catch (error) {
          console.error('AI response error:', error)
        }
      })()

      // Don't await the AI response
      aiPromise.catch(console.error)
    }

    return response
  } catch (error) {
    console.error('Message API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    )
  }
} 