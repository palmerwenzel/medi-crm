import { ChatSession, MessageMetadata, TriageDecision, ChatAccess } from '@/types/domain/chat';
import { UIMessage, MessageStatus } from '@/types/domain/ui';
import { UserId } from '@/types/domain/users';
import { processMessage } from '@/lib/actions/medical-chat-actions';
import { createClient } from '@/utils/supabase/client';

export class ChatController {
  private session: ChatSession;
  private supabase = createClient();

  constructor(session: ChatSession) {
    this.session = session;
  }

  async processMessage(message: UIMessage): Promise<UIMessage> {
    try {
      // Process message through LLM
      const llmResponse = await processMessage({
        content: message.content,
        messageCount: this.session.messageCount,
        messageHistory: this.session.messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        conversationId: this.session.id
      });

      if (!llmResponse?.metadata) {
        throw new Error('LLM response missing metadata');
      }

      // Create base metadata
      const baseMetadata: MessageMetadata = llmResponse.metadata;

      // Create UI message metadata by adding status
      const metadata: MessageMetadata & { status: MessageStatus } = {
        ...baseMetadata,
        status: 'delivered'
      };

      // Handle handoff if decision was made
      if (
        baseMetadata.type === 'handoff' && 
        baseMetadata.triage_decision
      ) {
        await this.initiateHandoff(baseMetadata.triage_decision);
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
    } catch (error) {
      console.error('Failed to process message:', error);
      
      // Return error message with appropriate metadata
      return {
        id: crypto.randomUUID(),
        conversation_id: this.session.id,
        content: 'I apologize, but I encountered an error processing your message. Please try again.',
        role: 'assistant',
        created_at: new Date().toISOString(),
        state: { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' },
        metadata: {
          type: 'standard',
          status: 'delivered'
        }
      };
    }
  }

  private async initiateHandoff(decision: TriageDecision) {
    try {
      // Find available staff based on triage decision
      const { data: staff, error: staffError } = await this.supabase
        .from('users')
        .select('id, specialty, department')
        .eq('role', 'staff')
        .eq('status', 'active')
        .order('last_active', { ascending: false })
        .limit(1)
        .single();

      if (staffError || !staff?.id) {
        throw new Error(staffError?.message || 'No available staff found');
      }

      // Update session access with selected provider
      const newAccess: ChatAccess = {
        can_access: 'provider',
        provider_id: staff.id as UserId
      };
      
      this.session.access = newAccess;
      this.session.status = 'waiting_provider';

      // Send notification to selected provider
      const { error: notifyError } = await this.supabase.rpc('send_notification', {
        p_user_id: staff.id,
        p_type: 'handoff_request',
        p_title: this.getHandoffTitle(decision),
        p_content: 'AI has completed initial assessment and recommends provider review.',
        p_metadata: {
          handoff: {
            from_ai: true,
            reason: decision,
            urgency: this.getHandoffUrgency(decision)
          },
          conversation: {
            id: this.session.id
          }
        },
        p_priority: this.getHandoffPriority(decision)
      });

      if (notifyError) {
        throw new Error(`Failed to notify provider: ${notifyError.message}`);
      }
    } catch (error) {
      console.error('Failed to initiate handoff:', error);
      throw error;
    }
  }

  private getHandoffTitle(decision: TriageDecision): string {
    switch (decision) {
      case 'EMERGENCY':
        return 'Urgent: New patient requires immediate attention';
      case 'URGENT':
        return 'High Priority: New patient requires prompt attention';
      case 'NON_URGENT':
        return 'New patient requires review';
      case 'SELF_CARE':
        return 'New patient seeking guidance';
      default:
        return 'New patient requires review';
    }
  }

  private getHandoffUrgency(decision: TriageDecision): 'high' | 'medium' | 'low' {
    switch (decision) {
      case 'EMERGENCY':
        return 'high';
      case 'URGENT':
        return 'high';
      case 'NON_URGENT':
        return 'medium';
      case 'SELF_CARE':
        return 'low';
      default:
        return 'medium';
    }
  }

  private getHandoffPriority(decision: TriageDecision): 'urgent' | 'high' | 'medium' | 'low' {
    switch (decision) {
      case 'EMERGENCY':
        return 'urgent';
      case 'URGENT':
        return 'high';
      case 'NON_URGENT':
        return 'medium';
      case 'SELF_CARE':
        return 'low';
      default:
        return 'medium';
    }
  }
} 