import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { MessageMetadata, UIMessage } from '@/types/chat';
import { canCreateCase, createCaseFromChat } from '@/lib/services/case-from-chat';
import { ConsentDialog } from './consent-dialog';
import { generateChatResponse } from '@/lib/ai/openai';
import { CONSENT_REQUEST_PROMPT } from '@/lib/ai/prompts';

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
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [caseSummary, setCaseSummary] = useState<any>(null);

  // Request consent with AI explanation
  const handleRequestConsent = async () => {
    try {
      // Generate AI response explaining case creation
      const consentResponse = await generateChatResponse([
        ...messages,
        { role: 'system', content: CONSENT_REQUEST_PROMPT }
      ]);

      // Add AI's consent request to message history
      // TODO: Implement message addition through chat service
      console.log('AI Consent Request:', consentResponse);

      // Show consent dialog with case summary
      const { canCreate, missingInfo, confidence } = await canCreateCase(messages, metadata);
      
      if (!canCreate) {
        setError(
          `Cannot create case yet. Missing information: ${missingInfo.join(', ')}. ` +
          `Confidence: ${Math.round(confidence * 100)}%`
        );
        return;
      }

      // Generate case summary for review
      const summary = await generateCaseSummary();
      setCaseSummary(summary);
      setShowConsentDialog(true);
    } catch (err) {
      setError('Failed to prepare case summary. Please try again.');
    }
  };

  // Generate case summary for review
  const generateCaseSummary = async () => {
    // This would use the generateChatSummary function from case-from-chat service
    // For now, we'll use a placeholder
    return {
      title: 'Medical Consultation',
      description: 'Patient seeking medical attention',
      key_symptoms: metadata.collectedInfo?.chiefComplaint ? [metadata.collectedInfo.chiefComplaint] : [],
      severity: metadata.collectedInfo?.severity || 'Not specified',
      duration: metadata.collectedInfo?.duration || 'Not specified',
      urgency_level: metadata.triageDecision === 'EMERGENCY' ? 'emergency' : 'routine'
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
        <Button
          variant="outline"
          onClick={handleRequestConsent}
          disabled={isCreatingCase}
        >
          Create Case
        </Button>
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