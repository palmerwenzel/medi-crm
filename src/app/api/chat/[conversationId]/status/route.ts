/**
 * API route for updating conversation status
 */
import { NextRequest, NextResponse } from 'next/server'
import { updateConversationStatus } from '@/lib/actions/chat'
import { conversationStatusEnum } from '@/lib/validations/chat'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const body = await req.json()
    const status = conversationStatusEnum.parse(body.status)

    const result = await updateConversationStatus(params.conversationId, status)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update status' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Status update API error:', error)
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    )
  }
} 