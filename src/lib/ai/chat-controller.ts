import { ChatSession, MessageMetadata, TriageDecision, UIMessage } from '@/types/chat';
import { LLMController } from './llm-controller';

export class ChatController {
  private session: ChatSession;
  private llm: LLMController;

  constructor(session: ChatSession) {
    this.session = session;
    this.llm = new LLMController();
  }

  async processMessage(message: UIMessage): Promise<UIMessage> {
    // Process message through LLM
    const llmResponse = await this.llm.processMessage(
      message.content,
      this.session.messageCount
    );

    // Update metadata with LLM response
    const metadata: MessageMetadata = {
      status: 'delivered',
      ...llmResponse.metadata
    };

    // Handle handoff if decision was made
    if (metadata.triageDecision && metadata.triageDecision !== 'CONTINUE_GATHERING') {
      await this.initiateHandoff(metadata.triageDecision);
    }

    // Generate response message
    return {
      id: crypto.randomUUID(),
      conversation_id: this.session.id,
      content: llmResponse.message,
      role: 'assistant',
      created_at: new Date().toISOString(),
      state: { status: 'sent', id: crypto.randomUUID() },
      metadata
    };
  }

  private async initiateHandoff(decision: TriageDecision) {
    // Update session access and status
    this.session.access = {
      canAccess: 'provider',
      handoffTimestamp: new Date()
    };
    
    this.session.status = 'waiting_provider';
    
    // TODO: Implement provider notification system
    // - Update database with handoff status
    // - Notify relevant providers based on decision
    // - Generate and store handoff summary
  }
} 