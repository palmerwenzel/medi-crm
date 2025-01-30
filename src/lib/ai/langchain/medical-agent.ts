/**
 * Medical Agent Implementation
 * LangGraph-based agent with conversation persistence
 */

import {
  type BaseMessageLike,
  type BaseMessage,
} from "@langchain/core/messages";
import { entrypoint, addMessages, MemorySaver, getPreviousState } from "@langchain/langgraph";

// Import tools and tasks
import { callModel, callTool } from "./medical-tools";

/**
 * Thread-Level Persistence Setup
 */
const checkpointer = new MemorySaver();

/**
 * Medical Agent Definition
 * 
 * Features:
 * - Conversation persistence across interactions
 * - Medical context maintenance
 * - Parallel tool execution
 * - Structured medical data collection
 */
const medicalAgent = entrypoint({
  name: "medicalAgent",
  checkpointer,
}, async (messages: BaseMessageLike[]) => {
  // Get previous conversation state
  const previous = getPreviousState<BaseMessage>() ?? [];
  
  // Combine previous and new messages
  let currentMessages = addMessages(previous, messages);
  let llmResponse = await callModel(currentMessages);

  while (true) {
    // If no tool calls, we're done
    if (!llmResponse.tool_calls?.length) {
      break;
    }

    // Execute all tool calls in parallel
    const toolResults = await Promise.all(
      llmResponse.tool_calls.map((toolCall) => callTool(toolCall))
    );

    // Add the LLM response and tool results to the message list
    currentMessages = addMessages(currentMessages, [llmResponse, ...toolResults]);

    // Call model again with updated context
    llmResponse = await callModel(currentMessages);
  }

  // Add final response to conversation history
  currentMessages = addMessages(currentMessages, llmResponse);

  // Return final response and save conversation state
  return entrypoint.final({
    value: llmResponse,
    save: currentMessages,
  });
});

export { medicalAgent }; 