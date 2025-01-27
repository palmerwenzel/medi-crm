import { MessageMetadata, TriageDecision } from '@/types/domain/chat';
import { ChatResponse, isAIProcessingMetadata } from '@/types/domain/ai';
import { UserId } from '@/types/domain/users';
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
  chiefComplaint?: string;
  duration?: string;
  severity?: string;
  existingProvider?: string;
  urgencyIndicators: string[];
}

interface TriageResult {
  decision: TriageDecision;
  confidence: number;
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
    let metadata: MessageMetadata = { type: 'ai_processing' };

    // Update collected information
    const collectedInfo = await extractStructuredData(content);
    if (!collectedInfo) {
      throw new Error('Failed to extract information from message');
    }

    if (isAIProcessingMetadata(metadata)) {
      metadata.collectedInfo = collectedInfo;
    }

    if (messageCount >= DECISION_THRESHOLD) {
      const triageResult = await makeTriageDecision(openAIMessages);
      if (!isValidTriageResult(triageResult)) {
        throw new Error('Invalid triage decision received');
      }

      const { decision, confidence, reasoning } = triageResult;
      
      // If confidence is too low, continue gathering information
      if (confidence < 0.7 && decision !== 'EMERGENCY') {
        aiResponse = await generateChatResponse(openAIMessages);
      } else {
        aiResponse = await generateHandoffMessage(decision, reasoning, openAIMessages);
        metadata = {
          type: 'handoff',
          handoffStatus: 'pending',
          providerId: null as unknown as UserId, // Will be set by ChatController
          triageDecision: decision
        };
      }
    } else {
      // Continue gathering information
      const gatheringPrompt = createGatheringPrompt(messageCount, collectedInfo);
      
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
    throw error; // Let ChatController handle the error
  }
}

function isValidTriageResult(result: unknown): result is TriageResult {
  if (!result || typeof result !== 'object') return false;
  const r = result as TriageResult;
  return (
    typeof r.decision === 'string' &&
    typeof r.confidence === 'number' &&
    typeof r.reasoning === 'string' &&
    ['EMERGENCY', 'URGENT', 'NON_URGENT', 'SELF_CARE'].includes(r.decision)
  );
}

function createGatheringPrompt(messageCount: number, info: CollectedInfo): string {
  const missingInfo = [];
  if (!info.chiefComplaint) missingInfo.push('chief complaint');
  if (!info.duration) missingInfo.push('duration of symptoms');
  if (!info.severity) missingInfo.push('severity level');
  if (!info.existingProvider) missingInfo.push('existing provider information');

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