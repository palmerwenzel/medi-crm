/**
 * API route for conversation messages
 */
import { NextRequest, NextResponse } from 'next/server'
import { getMessages, sendMessage } from '@/lib/actions/chat'
import { messageQuerySchema, messageInsertSchema } from '@/lib/validations/chat'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

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
        { error: result.error || 'Failed to fetch messages' },
        { status: 400 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Messages API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
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
        { error: userResult.error || 'Failed to send message' },
        { status: 400 }
      )
    }

    // Return user message immediately
    const response = NextResponse.json({
      userMessage: userResult.data
    })

    // Get AI response asynchronously
    const aiPromise = (async () => {
      try {
        // Get previous messages for context
        const history = await getMessages(message.conversation_id, 1, 10)
        if (!history.success || !history.data) throw new Error('Failed to get message history')

        const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
          // Include system prompt if provided
          ...(metadata?.systemPrompt ? [{ role: 'system' as const, content: metadata.systemPrompt }] : []),
          // Include recent message history
          ...history.data.map(msg => ({
            role: msg.role as 'system' | 'user' | 'assistant',
            content: msg.content
          })),
          // Include current message
          { role: message.role as 'system' | 'user' | 'assistant', content: message.content }
        ]

        const aiResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages
        })

        const aiMessage = aiResponse.choices[0].message.content || ''

        // Store AI response
        await sendMessage(aiMessage, message.conversation_id, 'assistant')
      } catch (error) {
        console.error('AI response error:', error)
      }
    })()

    // Don't await the AI response
    aiPromise.catch(console.error)

    return response
  } catch (error) {
    console.error('Message API error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
} 