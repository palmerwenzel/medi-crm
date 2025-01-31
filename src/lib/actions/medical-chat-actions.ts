'use server'

import { type Message, type TriageDecision, type MessageMetadata } from '@/types/domain/chat'
import type { ExtractedAIData, ChatResponse } from '@/types/domain/ai'
import { medicalAgent } from '@/lib/ai/langchain/medical-agent'
import { validateMessageMetadata } from '@/lib/validations/message-metadata'
import { BaseMessageLike, HumanMessage, AIMessage, SystemMessage, isAIMessage, type BaseMessage } from '@langchain/core/messages'
import { MEDICAL_INTAKE_PROMPT } from '@/lib/ai/prompts'
import { type ActionResponse } from '@/types/domain/actions'

/**
 * Helper function to get the last AI message from a stream
 */
async function getLastAIMessage(stream: AsyncIterable<Record<string, BaseMessage>>): Promise<BaseMessage | null> {
  let lastMessage: BaseMessage | null = null;
  
  for await (const step of stream) {
    for (const [taskName, message] of Object.entries(step)) {
      if (taskName === "medicalAgent") continue;
      if (isAIMessage(message)) {
        lastMessage = message;
      }
    }
  }
  
  return lastMessage;
}

/**
 * Transforms database/UI messages to LangChain format
 */
function adaptMessagesToLangChain(params: {
  content: string;
  messageCount: number;
  messageHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}): BaseMessageLike[] {
  const messages: BaseMessageLike[] = [];

  // Add system prompt for new conversations or if it's not present
  const hasSystemPrompt = params.messageHistory.some(
    msg => msg.role === 'assistant' && msg.content === MEDICAL_INTAKE_PROMPT
  );
  
  if (params.messageCount === 0 || !hasSystemPrompt) {
    messages.push(new SystemMessage({ content: MEDICAL_INTAKE_PROMPT }));
  }

  // Add existing messages
  messages.push(
    ...params.messageHistory.map(msg =>
      msg.role === 'user'
        ? new HumanMessage({ content: msg.content })
        : new AIMessage({ content: msg.content })
    )
  );

  // Add the new message
  messages.push(new HumanMessage({ content: params.content }));

  return messages;
}

/**
 * Processes messages through the medical agent and returns a response with metadata.
 * This is the server action interface for the chat functionality.
 */
export async function processMessage(
  params: {
    content: string;
    messageCount: number;
    messageHistory: Array<{
      role: 'user' | 'assistant';
      content: string;
    }>;
    conversationId?: string;
  }
): Promise<ChatResponse> {
  try {
    // Transform messages to LangChain format
    const formattedMessages = params.messageHistory.map(msg =>
      msg.role === 'user'
        ? new HumanMessage({ content: msg.content })
        : new AIMessage({ content: msg.content })
    );
    
    // Add the new message
    formattedMessages.push(new HumanMessage({ content: params.content }));

    // Use the agent (which will handle system prompts and tools internally)
    const threadId = params.conversationId ?? `temp_${Date.now()}`;
    const stream = await medicalAgent.stream(formattedMessages, {
      configurable: { thread_id: threadId }
    });

    // Process the stream to get the last AI message
    let lastMessage: BaseMessage | null = null;
    for await (const step of stream) {
      for (const [taskName, message] of Object.entries(step)) {
        if (taskName === "medicalAgent") continue;
        lastMessage = message as BaseMessage;
      }
    }

    if (!lastMessage) {
      throw new Error('No AI response received');
    }

    // Extract the final message content
    const messageContent = lastMessage.content;

    // Default metadata
    let metadata: MessageMetadata = {
      type: 'ai_processing',
      collected_info: undefined,
      triage_decision: undefined
    };

    // If there's a case suggestion, include it in metadata
    if (typeof messageContent === 'string') {
      try {
        const parsed = JSON.parse(messageContent);
        if (parsed?.type === 'SUGGEST_CASE_CREATION') {
          metadata = {
            type: 'ai_processing',
            collected_info: parsed.suggestion.metadata?.medical_data,
            triage_decision: parsed.suggestion.metadata?.triage_assessment?.decision
          };
        }
      } catch (e) {
        // Not JSON or not a case suggestion, use default metadata
      }
    }

    return {
      message: typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent),
      metadata: validateMessageMetadata(metadata)
    };
  } catch (error) {
    console.error('Error in processMessage:', error);
    throw error;
  }
}

/**
 * Makes a triage decision using the medical agent
 */
export async function makeTriageDecision(
  messages: Message[]
): Promise<ActionResponse<{ decision: string; confidence: number }>> {
  try {
    // Get conversation ID from the first message
    const conversationId = messages[0].conversation_id;
    if (!conversationId) {
      throw new Error('Conversation ID is required for triage decision');
    }

    // Convert messages to LangChain format
    const formattedMessages: BaseMessageLike[] = messages.map(msg => 
      msg.role === 'user' 
        ? new HumanMessage({ content: msg.content })
        : new AIMessage({ content: msg.content })
    );

    // Use the agent but only extract the triage decision
    const stream = await medicalAgent.stream(formattedMessages, {
      configurable: {
        thread_id: conversationId
      }
    });

    // Process the stream to get the last AI message
    let lastMessage = null;
    for await (const chunk of stream) {
      if (chunk.value) {
        lastMessage = chunk;
      }
    }

    if (!lastMessage?.value) {
      throw new Error('No AI response received');
    }

    const messageContent = lastMessage.value.content;

    if (typeof messageContent === 'string') {
      try {
        const parsed = JSON.parse(messageContent);
        if (parsed?.type === 'SUGGEST_CASE_CREATION' && parsed.suggestion?.metadata?.triage_assessment) {
          const triage = parsed.suggestion.metadata.triage_assessment;
          return {
            success: true,
            data: {
              decision: triage.decision,
              confidence: triage.confidence
            }
          };
        }
      } catch (e) {
        // Not JSON or missing triage data
      }
    }

    throw new Error('No triage decision found in response');
  } catch (error) {
    console.error('Triage decision error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to make triage decision'
    };
  }
}

/**
 * Extracts medical information from a message
 */
export async function extractMedicalInformation(
  content: string
): Promise<ActionResponse<ExtractedAIData>> {
  try {
    // For single message extraction, we'll use a temporary thread ID
    const tempThreadId = `extract_${Date.now()}`;

    // Convert message to LangChain format
    const formattedMessages: BaseMessageLike[] = [
      new HumanMessage({ content })
    ];

    // Use the agent but only extract the structured medical data
    const stream = await medicalAgent.stream(formattedMessages, {
      configurable: {
        thread_id: tempThreadId
      }
    });

    // Process the stream to get the last AI message
    let lastMessage = null;
    for await (const chunk of stream) {
      if (chunk.value) {
        lastMessage = chunk;
      }
    }

    if (!lastMessage?.value) {
      throw new Error('No AI response received');
    }

    const messageContent = lastMessage.value.content;

    if (typeof messageContent === 'string') {
      try {
        const parsed = JSON.parse(messageContent);
        if (parsed?.type === 'SUGGEST_CASE_CREATION' && parsed.suggestion?.metadata?.medical_data) {
          return {
            success: true,
            data: parsed.suggestion.metadata.medical_data
          };
        }
      } catch (e) {
        // Not JSON or missing medical data
      }
    }

    throw new Error('No structured medical data found in response');
  } catch (error) {
    console.error('Medical extraction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract medical data'
    };
  }
} 