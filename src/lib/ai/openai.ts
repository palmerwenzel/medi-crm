'use server'

import OpenAI from 'openai';
import type { OpenAIRole } from '@/types/domain/roles';
import type { TriageDecision, CollectedMedicalInfo } from '@/types/domain/chat';
import { log, logPerformance } from '@/lib/utils/logging';

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

const DEFAULT_MODEL = 'gpt-4o-mini' as const;

const DEFAULT_OPTIONS: ChatOptions = {
  temperature: 0.7,
  maxTokens: 1000,
  model: DEFAULT_MODEL
};

/**
 * Base function for generating chat responses.
 */
export async function generateChatResponse(
  messages: Message[],
  options: ChatOptions = {}
): Promise<string> {
  const startTime = performance.now();
  const { temperature, maxTokens, model = DEFAULT_MODEL } = { ...DEFAULT_OPTIONS, ...options };

  log('Generating chat response:', {
    model,
    temperature,
    maxTokens,
    messageCount: messages.length
  });

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      log('No response from OpenAI');
      throw new Error('No response from OpenAI');
    }

    logPerformance('generateChatResponse', startTime);
    return response;
  } catch (error) {
    log('Error generating chat response:', error);
    throw error;
  }
}

/**
 * Optional function for guiding a more natural "clinical interview" flow.
 * Uses standard provider questioning frameworks (OPQRST, etc.)
 */
export async function generateClinicalInterviewResponse(
  userMessages: Message[],
  options: ChatOptions = {}
): Promise<string> {
  const startTime = performance.now();
  const { temperature, maxTokens, model = DEFAULT_MODEL } = { ...DEFAULT_OPTIONS, ...options };

  // Insert a system prompt that follows a recognized medical interview strategy.
  // This prompt references OPQRST, building rapport, gathering relevant history, etc.
  const conversationFlowPrompt: Message = {
    role: 'system',
    content: `
You are an empathetic medical assistant following a standard provider conversation flow. 
Use OPQRST or a similar approach for History of Present Illness:
 - O: Onset/Duration
 - P: Provocation or Palliation
 - Q: Quality
 - R: Radiation
 - S: Severity
 - T: Timing/Trend

Additionally, gather Past Medical History (chronic conditions, surgeries, medications, allergies) 
and relevant Social History (lifestyle, substance use). 
Be concise yet supportive. 
Acknowledge the patient's feelings, clarify details, and confirm understanding. 
If the patient has answered a question already, do not repeat it.
`
  };

  const assistantMessages = [conversationFlowPrompt, ...userMessages];
  console.log('assistantMessages', assistantMessages);

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: assistantMessages,
      temperature,
      max_tokens: maxTokens,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI for clinical interview.');
    }

    logPerformance('generateClinicalInterviewResponse', startTime);
    return response;
  } catch (error) {
    log('Error generating clinical interview response:', error);
    throw error;
  }
}

/**
 * Extract structured medical data from content, returning CollectedMedicalInfo.
 */
export async function extractStructuredData(content: string): Promise<CollectedMedicalInfo> {
  const startTime = performance.now();
  log('Extracting structured data from content length:', content.length);

  const messages: Message[] = [
    {
      role: 'system',
      content: `Extract medical information using this JSON structure:
{
  "domain_data": {
    "title": "Clinical summary (<15 words)",
    "description": "SOAP note assessment (<50 words)",
    "chief_complaint": "Primary symptom (ICD-10 coded)",
    "key_symptoms": ["Standardized SNOMED CT terms"],
    "duration": "ISO 8601 duration format",
    "severity": "Mild/Moderate/Severe/Critical",
    "urgency_indicators": ["Clinical red flags from NHS/NICE guidelines"]
  },
  "internal_metrics": {
    "field_confidence": { /* 0-1 confidence scores */ },
    "missing_critical_info": ["Required fields per NICE guidelines"]
  }
}

CRITICAL RULES:
1. Use standardized medical terminologies
2. Flag ANY potential emergency indicators
3. Require explicit duration quantification
4. Maintain symptom chronology
5. Preserve negation scoping`
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

    const fullResponse = JSON.parse(response);
    logPerformance('extractStructuredData', startTime);
    return fullResponse.domain_data;
  } catch (error) {
    log('Error extracting structured data:', error);
    throw error;
  }
}

/**
 * Makes a triage decision (EMERGENCY, URGENT, NON_URGENT, SELF_CARE) 
 * with confidence and brief reasoning.
 */
export async function makeTriageDecision(
  messages: Message[]
): Promise<{ decision: TriageDecision; confidence: number; reasoning: string }> {
  const startTime = performance.now();
  log('Making triage decision from messages:', messages.length);

  const systemPrompt = {
    role: 'system' as const,
    content: `Assess urgency using NHS triage protocol. Return JSON with:
- decision: ["EMERGENCY", "URGENT", "NON_URGENT", "SELF_CARE"]
- confidence: 0-1
- reasoning: Brief explanation

DECISION CRITERIA:
EMERGENCY: Immediate threat to life/limb/vision
URGENT: Requires <24h evaluation
NON_URGENT: Can wait 24-72h
SELF_CARE: No clinical intervention needed`
  };

  try {
    const response = await generateChatResponse([systemPrompt, ...messages], {
      temperature: 0,
      model: DEFAULT_MODEL
    });

    const result = JSON.parse(response);
    logPerformance('makeTriageDecision', startTime);
    return result;
  } catch (error) {
    log('Error making triage decision:', error);
    throw error;
  }
} 