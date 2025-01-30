/**
 * Medical Agent Test
 * Demonstrates the medical agent with conversation persistence
 */

import { BaseMessage, isAIMessage } from "@langchain/core/messages";
import { medicalAgent } from "./medical-agent";

// Verify environment
if (!process.env.OPENAI_API_KEY) {
  console.warn("NO KEY FOUND; TRY: OPENAI_API_KEY=$(cat .env.local | grep OPENAI_API_KEY | cut -d '=' -f2) npx tsx src/lib/ai/langsmith/test-agent.ts");
}

// Helper function to pretty print messages
function prettyPrintMessage(message: BaseMessage) {
  console.log("=".repeat(30), `${message.getType()} message`, "=".repeat(30));
  console.log(message.content);
  if (isAIMessage(message) && message.tool_calls?.length) {
    console.log("\nTool Calls:");
    console.log(JSON.stringify(message.tool_calls, null, 2));
  }
}

// Helper to check for case creation suggestions
function checkForCaseSuggestion(message: BaseMessage): { hasSuggestion: boolean; suggestion?: any } {
  if (!isAIMessage(message)) return { hasSuggestion: false };
  
  try {
    // First check tool calls
    if (message.tool_calls?.length) {
      for (const call of message.tool_calls) {
        if (call.name === 'suggestCaseCreation') {
          try {
            const args = typeof call.args === 'string' ? JSON.parse(call.args) : call.args;
            return {
              hasSuggestion: true,
              suggestion: {
                title: args.title,
                description: args.description,
                category: args.category,
                priority: args.priority,
                metadata: {
                  source: 'ai',
                  triage_assessment: args.triage_decision,
                  medical_data: args.structured_data,
                  ...args.metadata
                }
              }
            };
          } catch (e) {
            console.debug('Failed to parse suggestCaseCreation args:', e);
          }
        }
      }
    }

    // Then check message content
    if (typeof message.content === 'string') {
      try {
        const content = JSON.parse(message.content);
        if (content?.type === 'SUGGEST_CASE_CREATION' && content?.suggestion) {
          return { 
            hasSuggestion: true, 
            suggestion: content.suggestion 
          };
        }
      } catch (e) {
        // Not JSON or doesn't have the expected structure
        console.debug('Message content is not JSON');
      }
    }
  } catch (e) {
    console.debug('Error checking for case suggestion:', e);
  }
  
  return { hasSuggestion: false };
}

async function testMedicalAgent() {
  try {
    // Configuration for thread persistence
    const config = { configurable: { thread_id: "test_medical_conversation_1" } };

    console.log("\n🏥 Test Case 1: Emergency Scenario - Chest Pain");
    const messages1 = [
      { 
        role: "user", 
        content: "I've been having severe chest pain for the last 2 hours, radiating to my left arm." 
      },
      {
        role: "user",
        content: "Yes, I'm also sweating a lot and feeling nauseous. I have a history of high blood pressure."
      }
    ];

    console.log("\nStarting conversation...");
    for (const message of messages1) {
      console.log("\nUser:", message.content);
      const stream = await medicalAgent.stream([message], config);
      
      for await (const step of stream) {
        for (const [taskName, update] of Object.entries(step)) {
          const message = update as BaseMessage;
          if (taskName === "medicalAgent") continue;
          
          console.log(`\n${taskName}:`);
          prettyPrintMessage(message);
          
          // Check for case creation suggestion
          const { hasSuggestion, suggestion } = checkForCaseSuggestion(message);
          if (hasSuggestion) {
            console.log("\n📋 Case Creation Suggested:");
            console.log(JSON.stringify(suggestion, null, 2));
          }
        }
      }
    }

    console.log("\n🏥 Test Case 2: Non-Emergency Scenario - Minor Symptoms");
    const messages2 = [
      { 
        role: "user", 
        content: "I've had a mild headache for the past day, and some congestion." 
      },
      {
        role: "user",
        content: "No fever, just feeling a bit under the weather. Pain is about 3/10."
      }
    ];

    for (const message of messages2) {
      console.log("\nUser:", message.content);
      const stream = await medicalAgent.stream([message], config);
      
      for await (const step of stream) {
        for (const [taskName, update] of Object.entries(step)) {
          const message = update as BaseMessage;
          if (taskName === "medicalAgent") continue;
          
          console.log(`\n${taskName}:`);
          prettyPrintMessage(message);
          
          // Check for case creation suggestion
          const { hasSuggestion, suggestion } = checkForCaseSuggestion(message);
          if (hasSuggestion) {
            console.log("\n📋 Case Creation Suggested:");
            console.log(JSON.stringify(suggestion, null, 2));
          }
        }
      }
    }

    console.log("\n🏥 Test Case 3: Follow-up Scenario");
    const messages3 = [
      { 
        role: "user", 
        content: "I need to discuss my recent blood test results and adjust my medication." 
      }
    ];

    for (const message of messages3) {
      console.log("\nUser:", message.content);
      const stream = await medicalAgent.stream([message], config);
      
      for await (const step of stream) {
        for (const [taskName, update] of Object.entries(step)) {
          const message = update as BaseMessage;
          if (taskName === "medicalAgent") continue;
          
          console.log(`\n${taskName}:`);
          prettyPrintMessage(message);
          
          // Check for case creation suggestion
          const { hasSuggestion, suggestion } = checkForCaseSuggestion(message);
          if (hasSuggestion) {
            console.log("\n📋 Case Creation Suggested:");
            console.log(JSON.stringify(suggestion, null, 2));
          }
        }
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

// Run the test
console.log("🚀 Starting Medical Agent Test");
testMedicalAgent().catch((error) => {
  console.error("❌ Test failed with error:", error);
  process.exit(1);
}); 