/**
 * Medical Agent Test
 * Demonstrates the medical agent with conversation persistence
 */

import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { medicalAgent, type MedicalState } from "./medical-agent";

// Verify environment
if (!process.env.OPENAI_API_KEY) {
  console.warn("NO KEY FOUND; TRY: OPENAI_API_KEY=$(cat .env.local | grep OPENAI_API_KEY | cut -d '=' -f2) npx tsx src/lib/ai/langchain-agent/test-agent.ts");
}

// Helper function to pretty print messages
function prettyPrintMessage(message: string) {
  console.log("=".repeat(30), "message", "=".repeat(30));
  console.log(message);
}

// Helper to print state
function prettyPrintState(state: MedicalState | undefined | null) {
  if (!state) {
    console.log("\n📊 Current State: No state available");
    return;
  }
  
  console.log("\n📊 Current State:");
  console.log("OPQRST Status:", JSON.stringify(state.opqrstStatus, null, 2));
  
  // Count completed stages
  const completedStages = Object.entries(state.opqrstStatus)
    .filter(([_, isComplete]) => isComplete)
    .map(([stage]) => stage);
  
  console.log(`Completed Stages (${completedStages.length}/6):`, completedStages.join(', ') || 'none');
  console.log("Messages:", state.messages.length);
  
  if (state.triageResult) {
    console.log("Triage Result:", JSON.stringify(state.triageResult, null, 2));
  }
  if (state.medicalData) {
    console.log("Medical Data:", JSON.stringify(state.medicalData, null, 2));
  }
}

async function testMedicalAgent() {
  try {
    // Configuration for thread persistence
    const config = { configurable: { thread_id: "test_medical_conversation_1" } };

    console.log("\n🏥 Testing Medical Agent OPQRST Flow");
    
    // Test conversation flow
    const messages = [
      new HumanMessage("I've been having chest pain for the last hour"),
      new HumanMessage("It started suddenly while I was resting"),
      new HumanMessage("The pain gets worse when I breathe deeply"),
      new HumanMessage("It feels like a sharp, stabbing pain"),
      new HumanMessage("Yes, it spreads to my left shoulder"),
      new HumanMessage("The pain is about 8 out of 10"),
      new HumanMessage("It's been constant since it started")
    ];

    // Keep track of state
    let currentState: MedicalState = {
      messages: [],
      opqrstStatus: {
        onset: false,
        provocation: false,
        quality: false,
        radiation: false,
        severity: false,
        timing: false
      }
    };

    for (const message of messages) {
      console.log("\nUser:", message.content);
      
      // Add the new message to state
      currentState.messages = [...currentState.messages, message];
      
      console.log("📨 Sending messages:", currentState.messages.length);
      console.log("Current OPQRST Status:", JSON.stringify(currentState.opqrstStatus, null, 2));
      
      // Pass current state to the agent
      const result = await medicalAgent.invoke(
        currentState,
        config
      );
      
      // Update state from result
      if (result.save) {
        currentState = result.save as MedicalState;
        console.log("💾 State saved:");
        prettyPrintState(currentState);
      }

      // Handle response value
      if (result.value) {
        const response = result.value;
        console.log(`\n${response.type}:`);
        prettyPrintMessage(response.message);
        
        // Add AI response to history if it's from OPQRST interview
        if (response.type === 'opqrst_interview') {
          console.log("🤖 Adding AI response to history");
          currentState.messages.push(new AIMessage(response.message));
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