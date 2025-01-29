import { MessageMetadata, TriageDecision } from '@/types/domain/chat';
import { ChatResponse, isAIProcessingMetadata } from '@/types/domain/ai';
import { MessageRole, OpenAIRole, toOpenAIRole } from '@/types/domain/roles';
import { MEDICAL_INTAKE_PROMPT } from './prompts';
import { generateChatResponse, extractStructuredData, makeTriageDecision } from './openai';

const DECISION_THRESHOLD = 5;

interface ProcessMessageParams {
  content: string;
  messageCount: number;
  messageHistory: Array<{
    role: MessageRole;
    content: string;
  }>;
}

interface CollectedInfo {
  chief_complaint?: string;
  duration?: string;
  severity?: string;
  urgency?: string;
}

interface TriageResult {
  decision: TriageDecision;
  reasoning: string;
}

export async function processMessage({ 
  content, 
  messageCount, 
  messageHistory = []
}: ProcessMessageParams): Promise<ChatResponse> {
  try {
    // Initialize history if empty
    const history = messageHistory.length === 0 
      ? [{ role: 'assistant' as const, content: MEDICAL_INTAKE_PROMPT }]
      : messageHistory;

    // Transform roles for OpenAI
    const openAIMessages: Array<{ role: OpenAIRole; content: string }> = [
      // Add system prompt if it's a new conversation
      ...(messageHistory.length === 0 ? [{
        role: 'system' as const,
        content: 'You are a medical intake assistant. Be professional and thorough.'
      }] : []),
      // Transform existing messages
      ...history.map(msg => ({
        role: toOpenAIRole(msg.role),
        content: msg.content
      })),
      // Add the new user message
      {
        role: 'user' as const,
        content
      }
    ];

    let aiResponse: string;
    let metadata: MessageMetadata = {
      is_assessment_creation: true,
      collected_info: await extractStructuredData(content)
    };

    if (messageCount >= DECISION_THRESHOLD) {
      const triageResult = await makeTriageDecision(openAIMessages);
      if (!isValidTriageResult(triageResult)) {
        throw new Error('Invalid triage decision received');
      }

      const { decision, reasoning } = triageResult;
      
      // If it's an emergency, proceed with handoff
      if (decision === 'EMERGENCY') {
        aiResponse = await generateHandoffMessage(decision, reasoning, openAIMessages);
        metadata = {
          is_assessment_creation: true,
          collected_info: {
            urgency: decision,
            severity: reasoning
          }
        };
      } else {
        // Continue gathering information
        aiResponse = await generateChatResponse(openAIMessages);
      }
    } else {
      // Continue gathering information
      const gatheringPrompt = createGatheringPrompt(messageCount, metadata.collected_info || {});
      
      aiResponse = await generateChatResponse([
        ...openAIMessages,
        { role: 'system' as const, content: gatheringPrompt }
      ]);
    }

    if (!aiResponse) {
      throw new Error('Failed to generate AI response');
    }

    return {
      message: aiResponse,
      metadata
    };
  } catch (error) {
    console.error('Error in processMessage:', error);
    throw error;
  }
}

function isValidTriageResult(result: unknown): result is TriageResult {
  if (!result || typeof result !== 'object') return false;
  const r = result as TriageResult;
  return (
    typeof r.decision === 'string' &&
    typeof r.reasoning === 'string' &&
    ['EMERGENCY', 'URGENT', 'NON_URGENT', 'SELF_CARE'].includes(r.decision)
  );
}

function createGatheringPrompt(messageCount: number, info: CollectedInfo): string {
  const missingInfo = [];
  if (!info.chief_complaint) missingInfo.push('chief complaint');
  if (!info.duration) missingInfo.push('duration of symptoms');
  if (!info.severity) missingInfo.push('severity level');

  return `Based on the conversation so far, we still need information about: ${missingInfo.join(', ')}. 
    ${messageCount === 1 ? 'Start by asking about their main concern.' : 'Focus on gathering this missing information.'}
    Keep responses concise and professional.`;
}

async function generateHandoffMessage(
  decision: TriageDecision, 
  reasoning: string,
  history: Array<{ role: OpenAIRole; content: string }>
): Promise<string> {
  const prompts: Record<TriageDecision, string> = {
    EMERGENCY: 'Based on the information provided, this appears to be an emergency situation. I recommend seeking immediate medical attention.',
    URGENT: 'This situation requires urgent medical attention. While not an immediate emergency, you should be seen by a healthcare provider soon.',
    NON_URGENT: 'While your concerns are valid, this appears to be a non-urgent situation. I will connect you with a provider for further evaluation.',
    SELF_CARE: 'Based on your description, this can likely be managed with self-care measures. However, I will connect you with a provider for guidance.'
  };

  return await generateChatResponse([
    ...history,
    { role: 'system' as const, content: prompts[decision] }
  ]);
}

export async function processAIResponse(
  response: string,
  metadata: MessageMetadata
): Promise<{
  content: string
  metadata: MessageMetadata
}> {
  return {
    content: response,
    metadata: {
      ...metadata,
      is_final: true
    }
  }
}