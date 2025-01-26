'use server'

import OpenAI from 'openai';
import { ChatRequest, ChatResponse, TriageDecision } from '@/types/chat';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

const DEFAULT_MODEL = 'gpt-4-turbo-preview';
const MAX_TOKENS = 1000;

interface OpenAIConfig {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export async function generateChatResponse(
  messages: ChatRequest['messages'],
  config?: OpenAIConfig
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: config?.model || DEFAULT_MODEL,
      messages: messages.map(msg => ({
        role: msg.role === 'provider' ? 'assistant' : msg.role,
        content: msg.content
      })),
      temperature: config?.temperature || 0.7,
      max_tokens: config?.max_tokens || MAX_TOKENS,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate AI response');
  }
}

export async function extractStructuredData(
  content: string,
  schema: object
): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: `Extract structured information from the medical conversation. 
          Return only valid JSON matching this schema: ${JSON.stringify(schema)}`
        },
        { role: 'user', content }
      ],
      temperature: 0,
      response_format: { type: 'json_object' }
    });

    const jsonStr = response.choices[0]?.message?.content || '{}';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Data extraction error:', error);
    return {};
  }
}

export async function makeTriageDecision(
  messages: ChatRequest['messages']
): Promise<{ decision: TriageDecision; confidence: number; reasoning: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        ...messages,
        {
          role: 'system',
          content: `Based on the conversation, make a triage decision. Return JSON with:
          {
            "decision": "EXISTING_PROVIDER" | "NEW_TICKET" | "CONTINUE_GATHERING" | "EMERGENCY",
            "confidence": number between 0-1,
            "reasoning": "brief explanation"
          }`
        }
      ],
      temperature: 0,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    return {
      decision: result.decision || 'CONTINUE_GATHERING',
      confidence: result.confidence || 0,
      reasoning: result.reasoning || ''
    };
  } catch (error) {
    console.error('Triage decision error:', error);
    return {
      decision: 'CONTINUE_GATHERING',
      confidence: 0,
      reasoning: 'Error in decision making process'
    };
  }
} 