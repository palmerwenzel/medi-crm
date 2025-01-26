import { ChatRequest, ChatResponse, MessageMetadata, MessageRole, TriageDecision } from '@/types/chat';
import { MEDICAL_INTAKE_PROMPT, PROVIDER_SELECTION_PROMPT } from './prompts';
import { generateChatResponse, extractStructuredData, makeTriageDecision } from './openai';

export class LLMController {
  private messageHistory: ChatRequest['messages'] = [];
  private collectedInfo: MessageMetadata['collectedInfo'] = {};
  private readonly DECISION_THRESHOLD = 5;

  constructor() {
    // Initialize with system prompt
    this.messageHistory.push({
      role: 'system',
      content: MEDICAL_INTAKE_PROMPT
    });
  }

  async processMessage(content: string, messageCount: number): Promise<ChatResponse> {
    // Add user message to history
    this.messageHistory.push({
      role: 'user',
      content
    });

    let aiResponse: string;
    let metadata: MessageMetadata = {};

    // Update collected information with each message
    await this.updateCollectedInfo(content);
    metadata.collectedInfo = this.collectedInfo;

    if (messageCount >= this.DECISION_THRESHOLD) {
      // Time to make a decision
      const { decision, confidence, reasoning } = await makeTriageDecision(this.messageHistory);
      metadata.triageDecision = decision;
      metadata.confidenceScore = confidence;
      
      // If confidence is too low, continue gathering information
      if (confidence < 0.7 && decision !== 'EMERGENCY') {
        aiResponse = await generateChatResponse(this.messageHistory, { temperature: 0.7 });
      } else {
        aiResponse = await this.generateHandoffMessage(decision, reasoning);
      }
    } else {
      // Continue gathering information based on what's missing
      const remainingQuestions = this.DECISION_THRESHOLD - messageCount;
      const gatheringPrompt = this.createGatheringPrompt(remainingQuestions);
      
      aiResponse = await generateChatResponse([
        ...this.messageHistory,
        { role: 'system', content: gatheringPrompt }
      ], { temperature: 0.7 });
    }

    // Add AI response to history
    this.messageHistory.push({
      role: 'assistant',
      content: aiResponse
    });

    return {
      message: aiResponse,
      metadata
    };
  }

  private createGatheringPrompt(remainingMessages: number): string {
    const missingInfo = this.getMissingInformation();
    return `You have ${remainingMessages} messages left to gather critical information. 
    Focus on gathering these missing details in order of priority: ${missingInfo.join(', ')}.
    Ask one clear question at a time.`;
  }

  private getMissingInformation(): string[] {
    const missing: string[] = [];
    const info = this.collectedInfo;

    if (!info?.chiefComplaint) missing.push('chief complaint and immediate symptoms');
    if (!info?.duration) missing.push('duration and severity');
    if (!info?.existingProvider) missing.push('existing provider relationship');
    if (!info?.urgencyIndicators?.length) missing.push('potential red flags');
    
    return missing;
  }

  private async generateHandoffMessage(decision: TriageDecision, reasoning: string): Promise<string> {
    const handoffPrompt = this.createHandoffPrompt(decision, reasoning);
    return await generateChatResponse([
      ...this.messageHistory,
      { role: 'system', content: handoffPrompt }
    ]);
  }

  private async updateCollectedInfo(userMessage: string) {
    const schema = {
      chiefComplaint: "string?",
      duration: "string?",
      severity: "string?",
      existingProvider: "string?",
      urgencyIndicators: "string[]?"
    };

    const extractedData = await extractStructuredData(userMessage, schema);
    
    // Merge new data with existing data, keeping non-null values
    this.collectedInfo = {
      ...this.collectedInfo,
      ...Object.fromEntries(
        Object.entries(extractedData).filter(([_, value]) => value != null)
      )
    };
  }

  private createHandoffPrompt(decision: TriageDecision, reasoning: string): string {
    const prompts = {
      'EXISTING_PROVIDER': `Based on our conversation and the following reasoning: "${reasoning}", 
        I recommend connecting you with your existing provider. They are already familiar with your 
        medical history and would be best suited to help with your current situation.`,
      
      'NEW_TICKET': `Based on our conversation and the following reasoning: "${reasoning}", 
        I'll help connect you with an appropriate specialist who can provide the specific care you need.`,
      
      'EMERGENCY': `Based on our conversation and the following reasoning: "${reasoning}", 
        I recommend immediate medical attention. Would you like me to help you locate the nearest 
        emergency facility or assist with emergency services?`,
      
      'CONTINUE_GATHERING': `I need a bit more information to better understand your situation. 
        Specifically: "${reasoning}"`
    };
    
    return prompts[decision];
  }
} 