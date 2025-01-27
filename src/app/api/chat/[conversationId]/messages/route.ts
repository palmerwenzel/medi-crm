/**
 * API route for conversation messages
 */
import { NextRequest, NextResponse } from 'next/server'
import { getMessages, sendMessage } from '@/lib/actions/chat'
import { processAIMessage } from '@/lib/actions/ai'
import { messageQuerySchema, messageInsertSchema } from '@/lib/validations/chat'
import { MEDICAL_INTAKE_PROMPT } from '@/lib/ai/prompts'

export async function GET(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const query = messageQuerySchema.parse({
      conversation_id: params.conversationId,
      page,
      limit
    })

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

    // Validate and store user message
    const message = messageInsertSchema.parse({
      conversation_id: params.conversationId,
      content,
      role: role || 'user',
      metadata: metadata || {}
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

          const aiResult = await processAIMessage(history.data, MEDICAL_INTAKE_PROMPT)
          
          if (!aiResult.success) throw new Error(aiResult.error)

          // Store AI response with metadata
          await sendMessage(
            aiResult.data.message,
            message.conversation_id,
            'assistant',
            {
              type: 'ai_processing',
              status: 'delivered',
              confidenceScore: aiResult.data.metadata?.confidenceScore,
              collectedInfo: aiResult.data.metadata?.collectedInfo
            }
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