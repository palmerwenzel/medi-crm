/**
 * API route for conversation management
 */
import { NextRequest, NextResponse } from 'next/server'
import { 
  createConversation,
  getConversations 
} from '@/lib/actions/chat'
import { conversationQuerySchema } from '@/lib/validations/chat'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { patientId } = body

    const result = await createConversation(patientId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create conversation' },
        { status: 400 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Conversation API error:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const patientId = searchParams.get('patientId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') as 'active' | 'archived' | null

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      )
    }

    const query = conversationQuerySchema.parse({ page, limit, status })
    const result = await getConversations(patientId, query.page, query.limit, query.status)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch conversations' },
        { status: 400 }
      )
    }

    // Return data in a consistent format
    return NextResponse.json({
      success: true,
      data: result.data || []
    })
  } catch (error) {
    console.error('Conversation API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
} 