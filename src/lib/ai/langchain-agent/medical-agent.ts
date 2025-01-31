/**
 * Medical Agent Implementation
 * LangGraph-based agent with conversation persistence
 */

import { type BaseMessage } from "@langchain/core/messages";
import { 
  entrypoint, 
  MemorySaver,
  type LangGraphRunnableConfig
} from "@langchain/langgraph";
import { Client } from "langsmith";

// Import tasks
import {
  conductOPQRSTInterview,
  assessMedicalSituation,
  extractMedicalData,
  prepareCaseCreation
} from "./medical-tools";

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

// Define our state interface
interface MedicalState {
  messages: BaseMessage[];
  opqrstStatus: {
    onset: boolean;
    provocation: boolean;
    quality: boolean;
    radiation: boolean;
    severity: boolean;
    timing: boolean;
  };
  triageResult?: {
    decision: string;
    confidence: number;
    reasoning: string;
  };
  medicalData?: {
    structured_data: any;
    raw_text: string;
  };
}

// Helper to determine next OPQRST focus
function getNextOPQRSTFocus(status: MedicalState['opqrstStatus']) {
  const order: (keyof MedicalState['opqrstStatus'])[] = [
    'onset', 'provocation', 'quality', 'radiation', 'severity', 'timing'
  ];
  return order.find(key => !status[key]);
}

// Helper to check if OPQRST is complete
function isOPQRSTComplete(status: MedicalState['opqrstStatus']) {
  return Object.values(status).every(Boolean);
}

// Main medical agent entrypoint
const medicalAgent = entrypoint<MedicalState, Record<string, any>>(
  { name: "medicalAgent", checkpointer },
  async (
    input: MedicalState, 
    config: LangGraphRunnableConfig<Record<string, any>>
  ): Promise<Record<string, any>> => {
    // Get previous state or initialize new one
    const previousState = await checkpointer.get(config) as unknown as MedicalState | null;
    
    // Merge previous state with input state, preferring previous state's OPQRST status
    let state: MedicalState = {
      messages: [...(previousState?.messages || []), ...input.messages],
      opqrstStatus: input.opqrstStatus || previousState?.opqrstStatus || {
        onset: false,
        provocation: false,
        quality: false,
        radiation: false,
        severity: false,
        timing: false
      },
      triageResult: previousState?.triageResult || input.triageResult,
      medicalData: previousState?.medicalData || input.medicalData
    };

    // Main workflow loop
    while (true) {
      // Step 1: OPQRST Interview
      if (!isOPQRSTComplete(state.opqrstStatus)) {
        const currentFocus = getNextOPQRSTFocus(state.opqrstStatus);
        if (!currentFocus) {
          return entrypoint.final({
            value: {
              type: "error",
              message: "Failed to determine next OPQRST focus"
            },
            save: state
          });
        }

        // Get next question or completion status
        const response = await conductOPQRSTInterview({
          messages: state.messages,
          currentFocus
        });

        // Check if we've completed this focus area
        if (response.startsWith('COMPLETE: ')) {
          state = {
            ...state,
            opqrstStatus: {
              ...state.opqrstStatus,
              [currentFocus]: true
            }
          };
          console.log(`✅ Marked ${currentFocus} as complete`);
        }

        // Return response and updated state
        return entrypoint.final({
          value: {
            type: "opqrst_interview",
            message: response.replace('COMPLETE: ', ''),
            currentFocus
          },
          save: state
        });
      }

      // Step 2: Triage Assessment (only if OPQRST is complete)
      if (!state.triageResult) {
        const triageResult = await assessMedicalSituation({
          messages: state.messages
        });

        const updatedState = {
          ...state,
          triageResult
        };

        return entrypoint.final({
          value: {
            type: "assess_medical",
            message: triageResult.decision === "EMERGENCY" 
              ? "⚠️ EMERGENCY situation detected. Please review immediately."
              : triageResult.reasoning,
            result: triageResult
          },
          save: updatedState
        });
      }

      // Step 3: Extract Medical Data
      if (!state.medicalData) {
        const medicalData = await extractMedicalData({
          messages: state.messages
        });

        const updatedState = {
          ...state,
          medicalData
        };

        return entrypoint.final({
          value: {
            type: "extract_medical_data",
            message: "Medical data extracted and structured.",
            data: medicalData
          },
          save: updatedState
        });
      }

      // Step 4: Prepare Case
      const caseSuggestion = await prepareCaseCreation({
        messages: state.messages,
        triageResult: state.triageResult!,
        medicalData: state.medicalData!
      });

      return entrypoint.final({
        value: {
          type: "prepare_case",
          message: "Please review and approve the case creation",
          suggestion: caseSuggestion
        },
        save: state
      });
    }
  }
);

export { medicalAgent, type MedicalState }; 