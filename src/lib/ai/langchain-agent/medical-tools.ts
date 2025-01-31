/**
 * Medical Tools for LangGraph Agent
 * Defines tools, model setup, and task definitions
 */

import { ChatOpenAI } from "@langchain/openai";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { type BaseMessage } from "@langchain/core/messages";
import { task } from "@langchain/langgraph";
import { MEDICAL_AGENT_PROMPT, MEDICAL_SUMMARY_PROMPT } from "@/lib/ai/prompts";

// Initialize the model
const model = new ChatOpenAI({
  modelName: "gpt-4",
  temperature: 0.7,
});

/**
 * Task Definitions
 */

// Helper to get requirements for each focus area
function getFocusRequirements(focus: string): string {
  const requirements = {
    onset: "When and how the symptoms started (timing and circumstances of initial occurrence)",
    provocation: "What makes the symptoms better or worse (aggravating and alleviating factors)",
    quality: "The nature and characteristics of the symptoms (description of how it feels)",
    radiation: "Whether and where the symptoms spread to other areas",
    severity: "The intensity of symptoms on a scale of 1-10",
    timing: "How long symptoms last and any patterns in their occurrence"
  };
  return requirements[focus as keyof typeof requirements];
}

// Task to handle OPQRST interview steps
const conductOPQRSTInterview = task("opqrst_interview", async ({ 
  messages, 
  currentFocus
}: { 
  messages: BaseMessage[],
  currentFocus: 'onset' | 'provocation' | 'quality' | 'radiation' | 'severity' | 'timing'
}) => {
  console.log("🔍 Conducting OPQRST interview for:", currentFocus);
  
  const systemPrompt = {
    role: "system",
    content: `You are conducting an OPQRST medical interview.
Focus on gathering information about: ${currentFocus}

For ${currentFocus}, we need to know:
${getFocusRequirements(currentFocus)}

Review the conversation history carefully. 
If you have sufficient information about ${currentFocus}, respond with:
"COMPLETE: [summary of ${currentFocus} information]"

If you need more specific information about ${currentFocus}, ask a focused question.
Do not ask about other aspects of OPQRST at this time.`
  };

  const response = await model.invoke([systemPrompt, ...messages]);
  console.log("📝 OPQRST Response:", response.content);
  return response.content as string;
});

// Task to assess medical situation
const assessMedicalSituation = task("assess_medical", async ({ messages }: { messages: BaseMessage[] }) => {
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

SELF_CARE:
- Minor cold symptoms
- Simple first aid
- General wellness`
  };

  const response = await model.invoke([systemPrompt, ...messages]);
  const content = response.content as string;
  
  return {
    decision: content.includes('EMERGENCY') ? 'EMERGENCY' :
             content.includes('URGENT') ? 'URGENT' :
             content.includes('NON_URGENT') ? 'NON_URGENT' : 'SELF_CARE',
    confidence: 0.8,
    reasoning: content
  };
});

// Task to extract structured medical data
const extractMedicalData = task("extract_medical_data", async ({ messages }: { messages: BaseMessage[] }) => {
  const systemPrompt = {
    role: "system",
    content: MEDICAL_SUMMARY_PROMPT
  };

  const response = await model.invoke([systemPrompt, ...messages]);
  const content = response.content as string;
  
  return {
    structured_data: content,
    raw_text: messages.map(m => m.content).join('\n')
  };
});

// Task to prepare case creation
const prepareCaseCreation = task("prepare_case", async ({ 
  messages,
  triageResult,
  medicalData
}: { 
  messages: BaseMessage[],
  triageResult: { decision: string; confidence: number; reasoning: string; },
  medicalData: { structured_data: any; raw_text: string; }
}) => {
  return {
    type: 'SUGGEST_CASE_CREATION',
    suggestion: {
      title: "Medical Consultation",  // This will be refined based on chief complaint
      description: medicalData.raw_text,
      category: triageResult.decision === 'EMERGENCY' ? 'emergency' : 'general',
      priority: triageResult.decision === 'EMERGENCY' ? 'urgent' : 
               triageResult.decision === 'URGENT' ? 'high' : 'medium',
      metadata: {
        source: 'ai',
        triage_assessment: triageResult,
        medical_data: medicalData.structured_data,
        opqrst_complete: true
      }
    }
  };
});

// Task to call model with medical context
const callModel = task("call_model", async (messages: BaseMessage[]) => {
  const messagesWithContext = [
    { role: "system", content: MEDICAL_AGENT_PROMPT },
    ...messages
  ];
  
  return model.invoke(messagesWithContext);
});

export {
  model,
  conductOPQRSTInterview,
  assessMedicalSituation,
  extractMedicalData,
  prepareCaseCreation,
  callModel
}; 
