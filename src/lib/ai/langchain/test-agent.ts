/**
 * Medical Agent Test
 * Demonstrates the medical agent with conversation persistence
 */

import { BaseMessage, isAIMessage } from "@langchain/core/messages";
import { medicalAgent } from "./medical-agent";

// Helper function to pretty print messages
function prettyPrintMessage(message: BaseMessage) {
  console.log("=".repeat(30), `${message.getType()} message`, "=".repeat(30));
  console.log(message.content);
  if (isAIMessage(message) && message.tool_calls?.length) {
    console.log("\nTool Calls:");
    console.log(JSON.stringify(message.tool_calls, null, 2));
  }
}

async function testMedicalAgent() {
  // Configuration for thread persistence
  const config = { configurable: { thread_id: "test_medical_conversation_1" } };

  // Example 1: Initial Complaint
  console.log("\n🏥 Test Case 1: Initial Complaint");
  const userMessage1 = { 
    role: "user", 
    content: "I've been having severe chest pain for the last 2 hours, radiating to my left arm." 
  };
  console.log("\nUser:", userMessage1.content);

  const stream1 = await medicalAgent.stream([userMessage1], config);
  for await (const step of stream1) {
    for (const [taskName, update] of Object.entries(step)) {
      const message = update as BaseMessage;
      if (taskName === "medicalAgent") continue;
      console.log(`\n${taskName}:`);
      prettyPrintMessage(message);
    }
  }

  // Example 2: Additional Symptoms (Same Thread)
  console.log("\n🏥 Test Case 2: Additional Symptoms (Same Thread)");
  const userMessage2 = { 
    role: "user", 
    content: "I also feel nauseous and I'm sweating a lot. I have a history of high blood pressure." 
  };
  console.log("\nUser:", userMessage2.content);

  const stream2 = await medicalAgent.stream([userMessage2], config);
  for await (const step of stream2) {
    for (const [taskName, update] of Object.entries(step)) {
      const message = update as BaseMessage;
      if (taskName === "medicalAgent") continue;
      console.log(`\n${taskName}:`);
      prettyPrintMessage(message);
    }
  }
}

// Run the test
console.log("🚀 Starting Medical Agent Test");
testMedicalAgent().catch(console.error); 