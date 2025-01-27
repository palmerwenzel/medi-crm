/**
 * API route for handling medical intake chatbot conversations.
 */
import { NextRequest, NextResponse } from 'next/server';
import { processAIMessage } from '@/lib/actions/ai';
import { type ChatRequest, type ChatResponse } from '@/types/domain/ai';

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();

    const result = await processAIMessage(body.messages);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'No response data');
    }

    return NextResponse.json<ChatResponse>({ 
      message: result.data.message 
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat' }, 
      { status: 500 }
    );
  }
}