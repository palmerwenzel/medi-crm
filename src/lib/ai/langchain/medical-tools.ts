/**
 * Medical Tools for LangGraph Agent
 * Defines tools, model setup, and task definitions
 */

import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { type Message } from "@/types/domain/chat";
import { 
  generateClinicalInterviewResponse,
  makeTriageDecision as aiMakeTriageDecision,
  extractStructuredData 
} from "@/lib/ai/openai";
import {
  type BaseMessageLike,
  type BaseMessage,
  AIMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { type ToolCall } from "@langchain/core/messages/tool";
import { task } from "@langchain/langgraph";
import { createCase } from "@/lib/actions/cases";
import type { CaseCategory, CasePriority, CaseStatus } from "@/types/domain/cases";

// Initialize the model
const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
});

/**
 * Tool Definitions
 */

// Clinical Interview Tool
const conductClinicalInterview = tool(async ({ messages }) => {
  const response = await generateClinicalInterviewResponse(messages);
  return response;
}, {
  name: "conductClinicalInterview",
  description: "Conducts a clinical interview following OPQRST framework and standard medical questioning protocols.",
  schema: z.object({
    messages: z.array(z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string()
    })).describe("Array of conversation messages to analyze")
  })
});

// Triage Assessment Tool
const assessTriage = tool(async ({ messages }) => {
  const { decision, confidence, reasoning } = await aiMakeTriageDecision(messages);
  return JSON.stringify({
    decision,
    confidence,
    reasoning
  });
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
    const data = await extractStructuredData(content);
    return JSON.stringify(data, null, 2);
  } catch (error) {
    // If structured extraction fails, return a simpler format
    return JSON.stringify({
      content,
      error: "Could not extract structured data",
      raw_text: true
    }, null, 2);
  }
}, {
  name: "extractMedicalData",
  description: "Extracts structured medical information from conversation text, including symptoms, duration, severity, etc.",
  schema: z.object({
    content: z.string().describe("Text content to extract medical information from")
  })
});

// Case Suggestion Tool
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
    // Format the suggestion in a consistent way
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
  description: "Signals to the application that enough information has been gathered to create a case, and provides the structured case data for user confirmation.",
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
  conductClinicalInterview,
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
    role: "system",
    content: `You are a medical assistant trained to:
1. Conduct clinical interviews using OPQRST framework
2. Assess medical situations for triage
3. Extract structured medical information
4. Suggest case creation when sufficient information is gathered
5. Provide clear, accurate medical guidance within scope

Use available tools to gather information and make assessments.
Always err on the side of caution for patient safety.
If you detect any emergency indicators, prioritize immediate medical attention.

When suggesting case creation:
- Ensure you have gathered comprehensive OPQRST information
- Include a clear title that captures the chief complaint
- Provide detailed description with all relevant medical details
- Set appropriate priority based on triage assessment
- Choose appropriate category based on context
- Include all structured data and triage assessment

Only suggest case creation when you have gathered sufficient information to make an informed assessment.
For emergency situations, suggest case creation as soon as you have confirmed the emergency indicators.`
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
