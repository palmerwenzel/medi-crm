import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { MessageMetadata } from '@/types/domain/chat';
import { UIMessage } from '@/types/domain/ui';
import { canCreateCase, createCaseFromChat } from '@/lib/services/case-from-chat';
import { ConsentDialog } from './consent-dialog';
import { medicalAgent } from '@/lib/ai/langchain/medical-agent';
import { CONSENT_REQUEST_PROMPT } from '@/lib/ai/prompts';
import { isAIProcessingMetadata } from '@/types/domain/ai';
import type { CaseSummary } from '@/types/domain/ui'
import { useAuth } from '@/providers/auth-provider';
import { BaseMessageLike, HumanMessage, SystemMessage } from '@langchain/core/messages';

interface ChatActionsProps {
  conversationId: string;
  messages: UIMessage[];
  metadata: MessageMetadata;
  patientId: string;
  onCaseCreated?: (caseId: string) => void;
}

export function ChatActions({
  conversationId,
  messages,
  metadata,
  patientId,
  onCaseCreated
}: ChatActionsProps) {
  const { userRole } = useAuth();
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [caseSummary, setCaseSummary] = useState<CaseSummary | null>(null);

  // Request consent with AI explanation
  const handleRequestConsent = async () => {
    try {
      console.log('Starting handleRequestConsent', { userRole, conversationId, messages });

      // Check if user is a patient
      if (userRole !== 'patient') {
        console.log('User is not a patient', { userRole });
        setError('Only patients can create cases');
        return;
      }

      // Convert messages to LangChain format
      const formattedMessages: BaseMessageLike[] = [
        new SystemMessage({ content: CONSENT_REQUEST_PROMPT }),
        ...messages.map(msg => 
          msg.role === 'user' 
            ? new HumanMessage({ content: msg.content })
            : new SystemMessage({ content: msg.content })
        )
      ];

      // Generate AI response explaining case creation
      console.log('Generating AI response');
      const stream = await medicalAgent.stream(formattedMessages, {
        configurable: {
          thread_id: conversationId
        }
      });

      // Process the stream to get the last AI message
      let lastMessage = null;
      for await (const chunk of stream) {
        if (chunk.value) {
          lastMessage = chunk;
        }
      }

      if (!lastMessage?.value) {
        throw new Error('No AI response received');
      }

      const consentResponse = lastMessage.value.content;
      console.log('Got AI response', { consentResponse });

      // Add AI's consent request to message history
      // TODO: Implement message addition through chat service
      console.log('AI Consent Request:', consentResponse);

      // Show consent dialog with case summary
      console.log('Checking if case can be created', { metadata });
      const { canCreate, missingInfo } = await canCreateCase(messages, metadata);
      console.log('Case creation check result', { canCreate, missingInfo });
      
      if (!canCreate) {
        const error = `Cannot create case yet. Missing information: ${missingInfo.join(', ')}`;
        console.log('Cannot create case', { error });
        setError(error);
        return;
      }

      // Generate case summary for review
      console.log('Generating case summary');
      const summary = await generateCaseSummary();
      console.log('Got case summary', { summary });
      setCaseSummary(summary);
      setShowConsentDialog(true);
    } catch (err) {
      console.error('Error in handleRequestConsent:', err);
      setError('Failed to prepare case summary. Please try again.');
    }
  };

  // Generate case summary for review
  const generateCaseSummary = async (): Promise<CaseSummary> => {
    // This would use the generateChatSummary function from case-from-chat service
    // For now, we'll use a placeholder
    return {
      title: 'Medical Consultation',
      description: 'Patient seeking medical attention',
      key_symptoms: isAIProcessingMetadata(metadata) && metadata.collected_info?.chief_complaint
        ? [metadata.collected_info.chief_complaint]
        : [],
      severity: isAIProcessingMetadata(metadata) ? metadata.collected_info?.severity || 'Not specified' : 'Not specified',
      duration: isAIProcessingMetadata(metadata) ? metadata.collected_info?.duration || 'Not specified' : 'Not specified',
      urgency_level: metadata.type === 'handoff' && metadata.triage_decision === 'EMERGENCY' ? 'emergency' : 'routine'
    };
  };

  // Handle case creation after consent
  const handleCreateCase = async () => {
    try {
      setIsCreatingCase(true);
      setError(null);
      setSuccess(null);

      const { caseId, error } = await createCaseFromChat(
        conversationId,
        messages,
        metadata,
        patientId,
        true // User has consented through dialog
      );

      if (error) {
        setError(error);
        return;
      }

      setSuccess('Case created successfully');
      onCaseCreated?.(caseId);
      setShowConsentDialog(false);
    } catch (err) {
      setError('Failed to create case. Please try again.');
    } finally {
      setIsCreatingCase(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert variant="default" className="border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700">Success</AlertTitle>
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {userRole === 'patient' && (
          <Button
            variant="outline"
            onClick={handleRequestConsent}
            disabled={isCreatingCase}
          >
            Create Case
          </Button>
        )}
      </div>

      {/* Consent Dialog */}
      <ConsentDialog
        isOpen={showConsentDialog}
        onClose={() => setShowConsentDialog(false)}
        onConfirm={handleCreateCase}
        summary={caseSummary}
        isLoading={isCreatingCase}
      />
    </div>
  );
} 