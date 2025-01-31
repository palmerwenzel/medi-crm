/**
 * Medical Tools for LangGraph Agent
 * Defines tools, model setup, and task definitions
 */

import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import {
  type BaseMessageLike,
  ToolMessage,
} from "@langchain/core/messages";
import { type ToolCall } from "@langchain/core/messages/tool";
import { task } from "@langchain/langgraph";
import { MEDICAL_AGENT_PROMPT } from "@/lib/ai/prompts";

// Initialize the model
const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
});

/**
 * Tool Definitions
 */

// Case Creation Tool
const CaseSchema = z.object({
  title: z.string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must not exceed 100 characters")
    .describe("A clear, concise title describing the main complaint"),
  
  description: z.string()
    .min(20, "Description must be at least 20 characters")
    .describe("Detailed description from the OPQRST summary"),
  
  category: z.enum(['general', 'followup', 'prescription', 'test_results', 'emergency'])
    .describe("The category of medical case"),
  
  priority: z.enum(['low', 'medium', 'high', 'urgent'])
    .describe("Priority level based on severity and recommendations"),
  
  metadata: z.object({
    symptoms: z.array(z.string())
      .min(1, "At least one symptom must be provided")
      .describe("List of key symptoms"),
    
    severity: z.number()
      .min(1)
      .max(10)
      .describe("Pain/severity level (1-10)"),
    
    duration: z.string()
      .describe("How long symptoms have been present"),
    
    aggravating_factors: z.array(z.string())
      .optional()
      .describe("What makes symptoms worse"),
    
    alleviating_factors: z.array(z.string())
      .optional()
      .describe("What makes symptoms better"),
    
    recommendations: z.array(z.string())
      .min(1, "At least one recommendation must be provided")
      .describe("List of care recommendations"),
    
    follow_up_timeframe: z.string()
      .describe("Suggested timeframe for follow-up"),
    
    warning_signs: z.array(z.string())
      .optional()
      .describe("Symptoms that would require immediate attention")
  }).describe("Additional structured information about the case")
});

const createCase = tool(async ({ summary }) => {
  try {
    const systemPrompt = {
      role: "system",
      content: `You are creating a structured medical case from an OPQRST summary.
You will receive a well-formatted OPQRST summary with clear sections.

Your task is to create a structured case with:
1. A clear, descriptive title that captures the main complaint
2. A comprehensive description incorporating all OPQRST details
3. An appropriate category based on severity and urgency
4. A priority level reflecting the clinical situation
5. Detailed metadata including:
   - All reported symptoms
   - Pain/severity level
   - Duration information
   - Any aggravating or alleviating factors
   - Specific recommendations based on the case
   - Appropriate follow-up timeframe
   - Any warning signs that require immediate attention

Base your assessment on:
- Symptom severity and progression
- Presence of concerning symptoms
- Treatment response
- Overall clinical picture

Format your response as a JSON object matching the specified schema.
Ensure all required fields are included and properly validated.`
    };

    const response = await model.invoke([
      systemPrompt,
      { role: "user", content: summary }
    ], {
      functions: [{
        name: "create_case",
        description: "Creates a structured medical case from OPQRST summary",
        parameters: {
          type: "object",
          required: ["title", "description", "category", "priority", "metadata"],
          properties: {
            title: {
              type: "string",
              description: "A clear, concise title describing the main complaint",
              minLength: 5,
              maxLength: 100
            },
            description: {
              type: "string",
              description: "Detailed description from the OPQRST summary",
              minLength: 20
            },
            category: {
              type: "string",
              enum: ['general', 'followup', 'prescription', 'test_results', 'emergency'],
              description: "The category of medical case"
            },
            priority: {
              type: "string",
              enum: ['low', 'medium', 'high', 'urgent'],
              description: "Priority level based on severity and recommendations"
            },
            metadata: {
              type: "object",
              required: ["symptoms", "severity", "duration", "recommendations", "follow_up_timeframe"],
              properties: {
                symptoms: {
                  type: "array",
                  items: { type: "string" },
                  description: "List of key symptoms",
                  minItems: 1
                },
                severity: {
                  type: "number",
                  description: "Pain/severity level (1-10)",
                  minimum: 1,
                  maximum: 10
                },
                duration: {
                  type: "string",
                  description: "How long symptoms have been present"
                },
                aggravating_factors: {
                  type: "array",
                  items: { type: "string" },
                  description: "What makes symptoms worse"
                },
                alleviating_factors: {
                  type: "array",
                  items: { type: "string" },
                  description: "What makes symptoms better"
                },
                recommendations: {
                  type: "array",
                  items: { type: "string" },
                  description: "List of care recommendations",
                  minItems: 1
                },
                follow_up_timeframe: {
                  type: "string",
                  description: "Suggested timeframe for follow-up"
                },
                warning_signs: {
                  type: "array",
                  items: { type: "string" },
                  description: "Symptoms that would require immediate attention"
                }
              }
            }
          }
        }
      }],
      function_call: { name: "create_case" }
    });
    
    // Parse and validate the response
    const functionCall = response.additional_kwargs.function_call;
    if (!functionCall?.arguments) {
      throw new Error("No function call arguments received");
    }

    const parsedCase = CaseSchema.parse(JSON.parse(functionCall.arguments));
    return JSON.stringify(parsedCase);
  } catch (error) {
    console.error('Case creation error:', error);
    if (error instanceof z.ZodError) {
      return JSON.stringify({
        type: 'VALIDATION_ERROR',
        errors: error.errors
      });
    }
    return JSON.stringify({
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Failed to create case'
    });
  }
}, {
  name: "createCase",
  description: "Creates a medical case from an OPQRST summary.",
  schema: z.object({
    summary: z.string().describe("The OPQRST summary to create a case from")
  })
});

// Combine all tools
const tools = [createCase];

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
    
    // Parse the args as JSON if it's a string
    const args = typeof toolCall.args === 'string' ? 
      JSON.parse(toolCall.args) : toolCall.args;
    
    // Invoke the tool with parsed args
    const result = await tool.invoke(args);
    
    return new ToolMessage({
      tool_call_id: toolCall.id ?? `${toolCall.name}_${Date.now()}`,
      name: toolCall.name,
      content: result
    });
  }
);

export { 
  model,
  tools,
  toolsByName,
  callModel,
  callTool
}; 
