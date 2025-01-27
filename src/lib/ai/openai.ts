'use server'

import OpenAI from 'openai';
import { OpenAIRole } from '@/types/domain/roles';
import { TriageDecision } from '@/types/domain/chat';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Message {
  role: OpenAIRole;
  content: string;
}

interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

const DEFAULT_MODEL = 'gpt-4-turbo-preview' as const;

const DEFAULT_OPTIONS: ChatOptions = {
  temperature: 0.7,
  maxTokens: 1000,
  model: DEFAULT_MODEL
};

export async function generateChatResponse(
  messages: Message[],
  options: ChatOptions = {}
): Promise<string> {
  const { temperature, maxTokens, model = DEFAULT_MODEL } = { ...DEFAULT_OPTIONS, ...options };

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return response;
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw error;
  }
}

export async function extractStructuredData(content: string): Promise<any> {
  const messages: Message[] = [
    {
      role: 'system',
      content: 'Extract structured medical information from the following text. Return a JSON object with fields: chiefComplaint, duration, severity, existingProvider, and urgencyIndicators (array).'
    },
    {
      role: 'user',
      content
    }
  ];

  try {
    const response = await generateChatResponse(messages, {
      temperature: 0,
      model: DEFAULT_MODEL
    });

    return JSON.parse(response);
  } catch (error) {
    console.error('Error extracting structured data:', error);
    throw error;
  }
}

export async function makeTriageDecision(
  messages: Message[]
): Promise<{ decision: TriageDecision; confidence: number; reasoning: string }> {
  const systemPrompt = {
    role: 'system' as const,
    content: `Analyze the conversation and make a triage decision. Return a JSON object with:
    - decision: One of ["EMERGENCY", "URGENT", "NON_URGENT", "SELF_CARE"]
      EMERGENCY: Life-threatening conditions requiring immediate attention
      URGENT: Serious but not immediately life-threatening
      NON_URGENT: Can be handled during regular office hours
      SELF_CARE: Can be managed with self-care measures and guidance
    - confidence: Number between 0 and 1
    - reasoning: Brief explanation of the decision`
  };

  try {
    const response = await generateChatResponse([systemPrompt, ...messages], {
      temperature: 0,
      model: DEFAULT_MODEL
    });

    return JSON.parse(response);
  } catch (error) {
    console.error('Error making triage decision:', error);
    throw error;
  }
} 