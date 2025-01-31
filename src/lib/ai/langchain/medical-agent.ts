/**
 * Medical Agent Implementation
 * LangGraph-based agent with conversation persistence
 */

import {
  type BaseMessageLike,
  type BaseMessage,
} from "@langchain/core/messages";
import { entrypoint, addMessages, MemorySaver, getPreviousState } from "@langchain/langgraph";
import { Client } from "langsmith";

// Import tools and tasks
import { callModel, callTool } from "./medical-tools";

// Initialize LangSmith client
new Client();

/**
 * Thread-Level Persistence Setup
 */
const checkpointer = new MemorySaver();

/**
 * Medical Agent Definition
 * 
 * Features:
 * - Natural OPQRST-based conversation
 * - Medical context maintenance
 * - Targeted tool usage for triage and case creation
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

  // Process the current message
  const llmResponse = await callModel(currentMessages);

  // If there are tool calls, process them sequentially
  if (llmResponse.tool_calls?.length) {
    const toolResults = await Promise.all(
      llmResponse.tool_calls.map((toolCall) => callTool(toolCall))
    );

    // Add tool results to conversation
    currentMessages = addMessages(currentMessages, [llmResponse, ...toolResults]);

    // Get final response after tool usage
    const finalResponse = await callModel(currentMessages);
    currentMessages = addMessages(currentMessages, finalResponse);

    return entrypoint.final({
      value: finalResponse,
      save: currentMessages,
    });
  }

  // If no tool calls, return the response directly
  currentMessages = addMessages(currentMessages, llmResponse);
  return entrypoint.final({
    value: llmResponse,
    save: currentMessages,
  });
});

export { medicalAgent }; 