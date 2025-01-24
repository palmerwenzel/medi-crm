/**
 * API route for deleting conversations
 */
import { NextRequest, NextResponse } from 'next/server'
import { deleteConversation } from '@/lib/actions/chat'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const result = await deleteConversation(params.conversationId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete conversation' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete conversation API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    )
  }
} 