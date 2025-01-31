/**
 * Medical Tools for LangGraph Agent
 * Defines tools, model setup, and task definitions
 */

import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { type Message } from "@/types/domain/chat";
import {
  type BaseMessageLike,
  type BaseMessage,
  AIMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { type ToolCall } from "@langchain/core/messages/tool";
import { task } from "@langchain/langgraph";
import type { CaseCategory, CasePriority, CaseStatus } from "@/types/domain/cases";
import { 
  MEDICAL_AGENT_PROMPT,
  MEDICAL_SUMMARY_PROMPT
} from "@/lib/ai/prompts";

// Initialize the model
const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
});

/**
 * Tool Definitions
 */

// Triage Assessment Tool
const assessTriage = tool(async ({ messages }) => {
  try {
    const systemPrompt = {
      role: "system",
      content: `Assess the medical situation using standard triage criteria:

EMERGENCY (immediate attention needed):
- Life-threatening conditions
- Severe chest pain, difficulty breathing
- Stroke symptoms
- Severe trauma

URGENT (within 24 hours):
- Moderate trauma
- Persistent fever
- Severe pain
- Worsening chronic conditions

NON_URGENT (within 72 hours):
- Minor injuries
- Mild symptoms
- Routine follow-up
- Medication refills

SELF_CARE:
- Minor cold symptoms
- Simple first aid
- General wellness

Return a JSON object with:
- decision: One of the above categories
- confidence: 0-1 score
- reasoning: Brief explanation`
    };

    const response = await model.invoke([systemPrompt, ...messages]);
    const content = response.content;
    
    // Parse the response if it's not already JSON
    if (typeof content === 'string' && !content.startsWith('{')) {
      return JSON.stringify({
        decision: content.includes('EMERGENCY') ? 'EMERGENCY' :
                 content.includes('URGENT') ? 'URGENT' :
                 content.includes('NON_URGENT') ? 'NON_URGENT' : 'SELF_CARE',
        confidence: 0.8,
        reasoning: content
      });
    }
    
    return content;
  } catch (error) {
    console.error('Triage assessment error:', error);
    throw error;
  }
}, {
  name: "assessTriage",
  description: "Assesses the medical situation and makes a triage decision (EMERGENCY, URGENT, NON_URGENT, SELF_CARE).",
  schema: z.object({
    messages: z.array(z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string()
    })).describe("Array of conversation messages to analyze for triage")
  })
});

// Medical Data Extraction Tool
const extractMedicalData = tool(async ({ content }) => {
  try {
    const systemPrompt = {
      role: "system",
      content: MEDICAL_SUMMARY_PROMPT
    };

    const response = await model.invoke([
      systemPrompt,
      { role: "user", content }
    ]);
    
    // Ensure response is properly formatted JSON
    const responseContent = response.content;
    if (typeof responseContent === 'string' && !responseContent.startsWith('{')) {
      return JSON.stringify({
        chief_complaint: content,
        structured: false,
        raw_text: responseContent
      });
    }
    
    return responseContent;
  } catch (error) {
    console.error('Medical data extraction error:', error);
    throw error;
  }
}, {
  name: "extractMedicalData",
  description: "Extracts structured medical information from conversation text.",
  schema: z.object({
    content: z.string().describe("Text content to extract medical information from")
  })
});

// Case Creation Suggestion Tool
const suggestCaseCreation = tool(async ({ 
  title,
  description,
  category,
  priority,
  triage_decision,
  structured_data,
  metadata = {}
}) => {
  try {
    const suggestion = {
      type: 'SUGGEST_CASE_CREATION',
      suggestion: {
        title,
        description,
        category,
        priority,
        metadata: {
          source: 'ai',
          triage_assessment: triage_decision,
          medical_data: structured_data,
          ...metadata
        }
      }
    };

    return JSON.stringify(suggestion, null, 2);
  } catch (error) {
    return JSON.stringify({
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Failed to create case suggestion'
    }, null, 2);
  }
}, {
  name: "suggestCaseCreation",
  description: "Signals that enough information has been gathered to create a case.",
  schema: z.object({
    title: z.string().describe("Clear summary of chief complaint"),
    description: z.string().describe("Detailed description from gathered medical info"),
    category: z.enum(['general', 'followup', 'prescription', 'test_results', 'emergency']).describe("Case category"),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).describe("Case priority based on triage"),
    triage_decision: z.object({
      decision: z.string(),
      confidence: z.number(),
      reasoning: z.string()
    }).describe("Triage assessment results"),
    structured_data: z.record(z.any()).optional().describe("Structured OPQRST and other medical data"),
    metadata: z.record(z.any()).optional().describe("Additional metadata about the case")
  })
});

// Combine all tools
const tools = [
  assessTriage,
  extractMedicalData,
  suggestCaseCreation
];

// Create a map of tools by name for easy lookup
const toolsByName = Object.fromEntries(tools.map((tool) => [tool.name, tool]));

/**
 * Task Definitions
 */

// Task to call the model with medical context
const callModel = task("callModel", async (messages: BaseMessageLike[]) => {
  // Add medical system prompt to guide the model's behavior
  const medicalSystemPrompt: BaseMessageLike = {
    type: "system",
    content: MEDICAL_AGENT_PROMPT,
    additional_kwargs: {}
  };

  // Combine system prompt with existing messages
  const messagesWithContext = [medicalSystemPrompt, ...messages];
  
  // Call model with tools bound
  const response = await model.bindTools(tools).invoke(messagesWithContext);
  return response;
});

// Task to execute tool calls
const callTool = task(
  "callTool",
  async (toolCall: ToolCall): Promise<ToolMessage> => {
    const tool = toolsByName[toolCall.name];
    if (!tool) {
      throw new Error(`Tool ${toolCall.name} not found`);
    }
    
    // Pass the entire toolCall to the tool for invocation
    return tool.invoke(toolCall);
  }
);

export { 
  model,
  tools,
  toolsByName,
  callModel,
  callTool
}; 
