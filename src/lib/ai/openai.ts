'use server'

import OpenAI from 'openai';
import type { OpenAIRole } from '@/types/domain/roles';
import type { TriageDecision, CollectedMedicalInfo } from '@/types/domain/chat';

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

export async function extractStructuredData(content: string): Promise<CollectedMedicalInfo> {
  const messages: Message[] = [
    {
      role: 'system',
      content: `Extract structured medical information from the conversation. Return a JSON object matching this format exactly:

{
  "title": "Brief (5-7 words) clinical summary of main complaint",
  "description": "2-3 sentence summary of the patient's situation, symptoms, and context",
  "chief_complaint": "Primary symptom or concern",
  "key_symptoms": ["Array of distinct symptoms", "Include secondary symptoms"],
  "duration": "How long symptoms have been present (e.g., '3 days', '2 weeks')",
  "severity": "One of: 'Mild', 'Moderate', 'Severe', or 'Critical'",
  "existing_provider": "Name of current provider if mentioned, otherwise null",
  "recommended_specialties": ["Relevant medical specialties based on symptoms"],
  "urgency_indicators": ["Any red flags", "Concerning symptoms", "Risk factors"]
}

Guidelines:
- Title should be clinical and concise (e.g., "Acute Migraine with Visual Disturbance")
- Description should prioritize medical relevance
- Duration must be in standardized format (e.g., "2 days", "3 weeks", "4 months")
- Severity must be one of the specified levels
- Include all symptoms mentioned, not just the primary complaint
- List specialties that would be relevant for the symptoms described

Example:
For "I've had a bad headache for 3 days with some blurry vision. It's worse than usual."

{
  "title": "Severe Headache with Visual Disturbance",
  "description": "Patient presents with a severe headache lasting 3 days, accompanied by blurred vision. Reports symptoms are worse than previous episodes.",
  "chief_complaint": "Severe headache",
  "key_symptoms": ["Headache", "Blurred vision"],
  "duration": "3 days",
  "severity": "Moderate",
  "existing_provider": null,
  "recommended_specialties": ["Neurology", "Ophthalmology"],
  "urgency_indicators": ["Vision changes", "Worsening severity"]
}`
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