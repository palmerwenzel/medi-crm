/**
 * Medical Agent Implementation
 * LangGraph-based agent with conversation persistence
 */

import {
  type BaseMessageLike,
  type BaseMessage,
  type MessageContent,
  AIMessage,
  FunctionMessage
} from "@langchain/core/messages";
import { entrypoint, addMessages, MemorySaver, getPreviousState } from "@langchain/langgraph";
import { Client } from "langsmith";
import { type ToolCall } from "@langchain/core/messages/tool";

// Import tools and tasks
import { callModel, callTool } from "./medical-tools";

// Initialize LangSmith client
new Client();

// Define state interface for OPQRST tracking
interface OPQRSTState {
  onset: boolean;
  provocation: boolean;
  quality: boolean;
  radiation: boolean;
  severity: boolean;
  timing: boolean;
}

interface ConversationState {
  messages: BaseMessage[];
  opqrstProgress: OPQRSTState;
  currentFocus?: keyof OPQRSTState;
  caseCreated: boolean;
}

/**
 * Thread-Level Persistence Setup
 */
const checkpointer = new MemorySaver();

// Helper functions for OPQRST management
function getNextOPQRSTFocus(progress: OPQRSTState): keyof OPQRSTState | undefined {
  const order: (keyof OPQRSTState)[] = ['onset', 'provocation', 'quality', 'radiation', 'severity', 'timing'];
  return order.find(key => !progress[key]);
}

function isOPQRSTComplete(progress: OPQRSTState): boolean {
  return Object.values(progress).every(Boolean);
}

// Helper to safely check string content
function isStringContent(content: MessageContent): content is string {
  return typeof content === 'string';
}

// Helper to safely get message content
function getMessageContent(message: BaseMessageLike): string | undefined {
  if (typeof message === 'string') return message;
  if ('content' in message) {
    const content = message.content;
    return isStringContent(content) ? content : undefined;
  }
  return undefined;
}

// Helper to create tool calls
function createToolCall(name: string, parameters: Record<string, unknown>): ToolCall {
  return {
    type: "tool_call" as const,
    name,
    id: `${name}_${Date.now()}`,
    args: parameters
  };
}

// Helper to add tool response to conversation
async function executeToolAndAddToHistory(
  toolCall: ToolCall,
): Promise<[BaseMessage, BaseMessage]> {
  // Execute the tool
  const toolResult = await callTool(toolCall);
  
  // Ensure we have a valid tool call ID
  const toolCallId = toolCall.id || `${toolCall.name}_${Date.now()}`;
  
  // Create the assistant's tool call message
  const assistantMessage = new AIMessage({
    content: "",
    additional_kwargs: {
      tool_calls: [{
        id: toolCallId,
        type: "function",
        function: {
          name: toolCall.name,
          arguments: JSON.stringify(toolCall.args)
        }
      }]
    }
  });

  // Create the tool's response message
  const toolResponseMessage = new FunctionMessage({
    content: toolResult.content,
    name: toolCall.name,
    additional_kwargs: { tool_call_id: toolCallId }
  });

  return [assistantMessage, toolResponseMessage];
}

// Helper to find message with content
function findMessageWithContent(messages: BaseMessage[], predicate: (content: string) => boolean): string {
  for (const message of messages) {
    const content = getMessageContent(message);
    if (content && predicate(content)) {
      return content;
    }
  }
  return "Information gathered";
}

/**
 * Medical Agent Definition
 * 
 * Features:
 * - Natural OPQRST-based conversation
 * - Medical context maintenance
 * - Focused information gathering
 * - Case creation after user confirmation
 */
const medicalAgent = entrypoint({
  name: "medicalAgent",
  checkpointer,
}, async (messages: BaseMessageLike[]) => {
  // Get previous conversation state
  const previous = getPreviousState<ConversationState>();
  
  // Initialize or restore conversation state
  const state: ConversationState = {
    messages: previous?.messages ?? [],
    opqrstProgress: previous?.opqrstProgress ?? {
      onset: false,
      provocation: false,
      quality: false,
      radiation: false,
      severity: false,
      timing: false
    },
    currentFocus: previous?.currentFocus,
    caseCreated: previous?.caseCreated ?? false
  };

  // Add new messages to state
  state.messages = addMessages(state.messages, messages);

  // If OPQRST is complete, handle case creation flow
  if (isOPQRSTComplete(state.opqrstProgress)) {
    const lastMessage = messages[messages.length - 1];
    const lastContent = lastMessage ? getMessageContent(lastMessage) : undefined;
    
    // If user has confirmed they want to create a case
    if (lastContent?.toLowerCase().includes('yes') && !state.caseCreated) {
      // Create and execute the case creation tool call
      const caseToolCall = createToolCall("createCase", {
        summary: `
OPQRST Summary:
--------------
Onset: ${findMessageWithContent(state.messages, content => 
  content.toLowerCase().includes("sudden") || content.toLowerCase().includes("gradual"))}
Provocation/Palliation: ${findMessageWithContent(state.messages, content => 
  content.toLowerCase().includes("better") || content.toLowerCase().includes("worse") || content.toLowerCase().includes("tried"))}
Quality: ${findMessageWithContent(state.messages, content => 
  content.toLowerCase().includes("throbbing") || content.toLowerCase().includes("sharp") || content.toLowerCase().includes("dull"))}
Region/Radiation: ${findMessageWithContent(state.messages, content => 
  content.toLowerCase().includes("spread") || content.toLowerCase().includes("moves"))}
Severity: ${findMessageWithContent(state.messages, content => 
  /\d+/.test(content) && (content.toLowerCase().includes("rate") || content.toLowerCase().includes("scale")))}
Timing: ${findMessageWithContent(state.messages, content => 
  content.toLowerCase().includes("started") || content.toLowerCase().includes("duration"))}

Associated Symptoms: ${findMessageWithContent(state.messages, content => 
  content.toLowerCase().includes("nausea") || content.toLowerCase().includes("vomit") || 
  content.toLowerCase().includes("dizzy") || content.toLowerCase().includes("vision"))}

Treatment History: ${findMessageWithContent(state.messages, content => 
  content.toLowerCase().includes("tried") || content.toLowerCase().includes("medication") || 
  content.toLowerCase().includes("treatment"))}

Medical History: ${findMessageWithContent(state.messages, content => 
  content.toLowerCase().includes("history") || content.toLowerCase().includes("condition") || 
  content.toLowerCase().includes("previous"))}
`
      });

      const [caseAssistantMessage, caseResponseMessage] = await executeToolAndAddToHistory(
        caseToolCall,
      );

      // Add both messages to state
      state.messages = addMessages(state.messages, [caseAssistantMessage, caseResponseMessage]);
      state.caseCreated = true;

      return entrypoint.final({
        value: {
          type: 'case_created',
          content: "I've created a case based on our discussion. A healthcare provider will review your information and follow up as needed. Please seek immediate medical attention if your symptoms worsen.",
          case: caseResponseMessage.content
        },
        save: state
      });
    }

    // If OPQRST is complete and case isn't created, ask for confirmation
    if (!state.caseCreated) {
      // Create a summary of gathered information
      const summary = [
        "Based on our discussion, I've gathered the following information:",
        "",
        "- **Onset**: " + findMessageWithContent(state.messages, content => 
          content.toLowerCase().includes("sudden") || content.toLowerCase().includes("gradual")),
        "- **Quality**: " + findMessageWithContent(state.messages, content => 
          content.toLowerCase().includes("throbbing") || content.toLowerCase().includes("sharp")),
        "- **Severity**: " + findMessageWithContent(state.messages, content => 
          content.includes("7") || content.includes("8")),
        "- **Associated Symptoms**: " + findMessageWithContent(state.messages, content => 
          content.toLowerCase().includes("nausea")),
        "",
        "Would you like me to create a case for a healthcare provider to review your symptoms?"
      ].join("\n");

      return entrypoint.final({
        value: {
          type: 'confirmation',
          content: summary
        },
        save: state
      });
    }
  }

  // If not complete, proceed with OPQRST gathering
  if (!isOPQRSTComplete(state.opqrstProgress)) {
    // Determine which aspect of OPQRST to focus on
    const nextFocus = getNextOPQRSTFocus(state.opqrstProgress);
    if (!nextFocus) {
      throw new Error("Failed to determine next OPQRST focus");
    }

    state.currentFocus = nextFocus;

    // Get focused response for current OPQRST aspect
    const response = await callModel([
      {
        type: "system",
        content: `You are conducting a focused medical interview. Currently gathering information about ${nextFocus.toUpperCase()}:
${nextFocus === 'onset' ? 'When did the symptoms start? Was it sudden or gradual?' :
  nextFocus === 'provocation' ? 'What makes the symptoms better or worse?' :
  nextFocus === 'quality' ? 'How would you describe the sensation/feeling?' :
  nextFocus === 'radiation' ? 'Does it spread or move to other areas?' :
  nextFocus === 'severity' ? 'On a scale of 1-10, how severe is it?' :
  'How long does it last? Is it constant or does it come and go?'}

Review the conversation history. If you have sufficient information about ${nextFocus}, summarize it.
If you need more specific information, ask a focused, natural follow-up question.
Keep your response conversational but professional.`
      },
      ...state.messages
    ]);

    const responseContent = response.content;
    // Check if we've gathered enough information for this aspect
    if (isStringContent(responseContent) && 
        (responseContent.toLowerCase().includes('sufficient information') || 
         responseContent.toLowerCase().includes('i understand'))) {
      state.opqrstProgress[nextFocus] = true;
    }

    // Add response to messages and continue conversation
    state.messages = addMessages(state.messages, response);
    return entrypoint.final({
      value: response,
      save: state
    });
  }

  // Handle any other follow-up conversation normally
  const response = await callModel(state.messages);
  state.messages = addMessages(state.messages, response);
  
  return entrypoint.final({
    value: response,
    save: state
  });
});

export { medicalAgent }; 