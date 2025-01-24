/**
 * API route for handling medical intake chatbot conversations.
 */
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ChatRequest, ChatResponse } from '@/types/chat';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: body.messages
    });

    const aiMessage = response.choices[0].message.content || '';

    return NextResponse.json<ChatResponse>({ 
      message: aiMessage 
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat' }, 
      { status: 500 }
    );
  }
}