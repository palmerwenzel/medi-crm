import { MessageMetadata, TriageDecision } from '@/types/domain/chat';
import { ChatRequest, isAIProcessingMetadata, isHandoffMetadata } from '@/types/domain/ai';
import { generateChatResponse, extractStructuredData } from '@/lib/ai/openai';
import { createCase } from '@/lib/actions/cases';
import { createClient } from '@/utils/supabase/client';
import { MEDICAL_SUMMARY_PROMPT } from '@/lib/ai/prompts';
import { CaseCategory } from '@/types/domain/cases';

interface ChatSummary {
  title: string;
  description: string;
  key_symptoms: string[];
  severity: string;
  duration: string;
  existing_provider?: string;
  recommended_specialties?: string[];
  urgency_level: 'routine' | 'urgent' | 'emergency';
  clinical_details?: {
    progression?: string;
    impact_on_daily_life?: string;
    previous_treatments?: string[];
    medical_history?: string[];
    risk_factors?: string[];
  };
  patient_context?: {
    treatment_preferences?: string[];
    access_to_care?: string;
    support_system?: string;
  };
}

/**
 * Generates a structured summary of the chat conversation with detailed medical context
 */
async function generateChatSummary(messages: ChatRequest['messages']): Promise<ChatSummary> {
  const summaryPrompt = `${MEDICAL_SUMMARY_PROMPT}
  Return a JSON object with the following structure:
  {
    "title": "Brief, descriptive title for the case",
    "description": "Detailed summary of the patient's situation",
    "key_symptoms": ["list", "of", "main", "symptoms"],
    "severity": "Description of severity",
    "duration": "How long issues have been present",
    "existing_provider": "Name of provider if mentioned",
    "recommended_specialties": ["relevant", "medical", "specialties"],
    "urgency_level": "routine" | "urgent" | "emergency",
    "clinical_details": {
      "progression": "How symptoms have changed over time",
      "impact_on_daily_life": "How this affects the patient",
      "previous_treatments": ["list", "of", "treatments"],
      "medical_history": ["relevant", "history", "items"],
      "risk_factors": ["identified", "risk", "factors"]
    },
    "patient_context": {
      "treatment_preferences": ["patient's", "preferences"],
      "access_to_care": "Any access considerations",
      "support_system": "Available support"
    }
  }`;

  const response = await generateChatResponse([
    ...messages,
    { role: 'assistant', content: summaryPrompt }
  ], { 
    temperature: 0,
    maxTokens: 1000 // Ensure we have enough tokens for detailed response
  });

  try {
    const summary = JSON.parse(response);
    return {
      ...summary,
      // Ensure required fields exist
      title: summary.title || 'Medical Consultation',
      description: summary.description || 'Patient seeking medical attention',
      key_symptoms: summary.key_symptoms || [],
      severity: summary.severity || 'Not specified',
      duration: summary.duration || 'Not specified',
      urgency_level: summary.urgency_level || 'routine'
    };
  } catch (error) {
    console.error('Error parsing chat summary:', error);
    throw new Error('Failed to generate chat summary');
  }
}

/**
 * Creates a case from chat conversation with patient consent
 */
export async function createCaseFromChat(
  conversationId: string,
  messages: ChatRequest['messages'],
  metadata: MessageMetadata,
  patientId: string,
  patientConsent: boolean = false
): Promise<{ caseId: string; error?: string }> {
  try {
    // Verify consent unless it's an emergency
    if (!isHandoffMetadata(metadata) || 
        (!patientConsent && metadata.triageDecision !== 'EMERGENCY')) {
      return { 
        caseId: '', 
        error: 'Patient consent required to create case' 
      };
    }

    // Generate chat summary
    const summary = await generateChatSummary(messages);

    // Determine priority based on urgency
    const priorityMap = {
      routine: 'low',
      urgent: 'medium',
      emergency: 'high'
    } as const;

    // Determine category based on urgency and triage decision
    const category: CaseCategory = summary.urgency_level === 'emergency' || metadata.triageDecision === 'EMERGENCY'
      ? 'emergency'
      : 'general';

    // Create the case
    const caseData = {
      title: summary.title,
      description: summary.description,
      patient_id: patientId,
      category,
      priority: priorityMap[summary.urgency_level],
      status: 'open' as const,
      metadata: {
        source: 'chat',
        conversation_id: conversationId,
        chat_summary: summary.description,
        key_symptoms: summary.key_symptoms,
        duration: summary.duration,
        severity: summary.severity,
        handoff_reason: metadata.triageDecision,
        recommended_specialties: summary.recommended_specialties
      }
    };

    const result = await createCase(caseData);
    
    if (!result.success || !result.data) {
      return {
        caseId: '',
        error: result.error || 'Failed to create case'
      };
    }

    // Update conversation with case ID
    await updateConversation(conversationId, {
      case_id: result.data.id,
      can_create_case: false
    });

    return { caseId: result.data.id };
  } catch (error) {
    console.error('Error creating case from chat:', error);
    return {
      caseId: '',
      error: 'Failed to create case from chat'
    };
  }
}

/**
 * Checks if a conversation has enough context to create a case
 */
export async function canCreateCase(
  messages: ChatRequest['messages'],
  metadata: MessageMetadata
): Promise<{ 
  canCreate: boolean; 
  missingInfo: string[];
  confidence: number;
}> {
  if (!isAIProcessingMetadata(metadata)) {
    return {
      canCreate: false,
      missingInfo: ['Required information not collected'],
      confidence: 0
    };
  }

  const requiredInfo = [
    'chiefComplaint',
    'duration',
    'severity'
  ] as const;

  const missingInfo = requiredInfo.filter(
    info => !metadata.collectedInfo?.[info]
  );

  const confidence = metadata.confidenceScore || 0;

  return {
    canCreate: missingInfo.length === 0 && confidence >= 0.7,
    missingInfo,
    confidence
  };
}

/**
 * Updates a conversation with case information
 */
async function updateConversation(
  conversationId: string,
  updates: {
    case_id: string;
    can_create_case: boolean;
  }
): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('medical_conversations')
    .update({
      case_id: updates.case_id,
      can_create_case: updates.can_create_case,
      updated_at: new Date().toISOString()
    })
    .eq('id', conversationId);

  if (error) {
    console.error('Error updating conversation:', error);
    throw new Error('Failed to update conversation with case information');
  }
} 