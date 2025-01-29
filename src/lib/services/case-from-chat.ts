import { MessageMetadata } from '@/types/domain/chat';
import { ChatRequest } from '@/types/domain/ai';
import { generateChatResponse } from '@/lib/ai/openai';
import { createCase } from '@/lib/actions/cases';
import { createClient } from '@/utils/supabase/client';
import { MEDICAL_SUMMARY_PROMPT } from '@/lib/ai/prompts';
import { CaseCategory } from '@/types/domain/cases';
import { CaseAssessment } from '@/types/domain/cases';
import { AssessmentCreatorType } from '@/types/domain/cases';
import { log, logPerformance } from '@/lib/utils/logging';
import { createAssessmentFromMetadata } from './case-assessments';

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
  const startTime = performance.now();
  log('Generating chat summary from messages:', messages.length, 'messages');

  const summaryPrompt = `${MEDICAL_SUMMARY_PROMPT}
  Return a JSON object with the following structure:
  {
    "domain_data": {
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
    },
    "internal_metrics": {
      "field_confidence": {
        "symptoms": 0.0-1.0,
        "severity": 0.0-1.0,
        "duration": 0.0-1.0,
        "urgency": 0.0-1.0,
        "clinical_details": 0.0-1.0,
        "patient_context": 0.0-1.0
      },
      "missing_info": ["list", "of", "missing", "fields"],
      "uncertainty_flags": ["areas", "needing", "clarification"],
      "suggested_questions": ["follow-up", "questions"],
      "triage_hints": ["areas", "needing", "clarification"]
    }
  }`;

  try {
    const response = await generateChatResponse([
      ...messages,
      { role: 'assistant', content: summaryPrompt }
    ], { 
      temperature: 0,
      maxTokens: 1000
    });

    const fullResponse = JSON.parse(response);
    
    log('Chat summary generated:', {
      title: fullResponse.domain_data.title,
      symptoms: fullResponse.domain_data.key_symptoms,
      urgency: fullResponse.domain_data.urgency_level
    });
    
    log('Internal metrics:', {
      confidence: fullResponse.internal_metrics.field_confidence,
      missingInfo: fullResponse.internal_metrics.missing_info,
      uncertaintyFlags: fullResponse.internal_metrics.uncertainty_flags,
      triageHints: fullResponse.internal_metrics.triage_hints
    });

    // Extract only the domain data
    const summary = fullResponse.domain_data;
    
    // Ensure required fields exist with clean domain data
    const result = {
      ...summary,
      title: summary.title || 'Medical Consultation',
      description: summary.description || 'Patient seeking medical attention',
      key_symptoms: summary.key_symptoms || [],
      severity: summary.severity || 'Not specified',
      duration: summary.duration || 'Not specified',
      urgency_level: summary.urgency_level || 'routine',
      clinical_details: summary.clinical_details || {},
      patient_context: summary.patient_context || {}
    };

    logPerformance('generateChatSummary', startTime);
    return result;
  } catch (error) {
    log('Error generating chat summary:', error);
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
  const startTime = performance.now();
  log('Starting case creation from chat:', { conversationId, patientId, consent: patientConsent });

  try {
    // Verify consent unless it's an emergency
    if (!patientConsent && metadata.triage_decision !== 'EMERGENCY') {
      log('Case creation blocked: No patient consent');
      return { 
        caseId: '', 
        error: 'Patient consent required to create case' 
      };
    }

    // Generate chat summary
    const summary = await generateChatSummary(messages);
    log('Generated summary for case:', {
      title: summary.title,
      urgency: summary.urgency_level,
      symptoms: summary.key_symptoms
    });

    // Determine priority based on urgency
    const priorityMap = {
      routine: 'low',
      urgent: 'medium',
      emergency: 'high'
    } as const;

    // Determine category based on urgency and triage decision
    const category: CaseCategory = summary.urgency_level === 'emergency' || metadata.triage_decision === 'EMERGENCY'
      ? 'emergency'
      : 'general';

    log('Case classification:', { category, priority: priorityMap[summary.urgency_level] });

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
        triage_decision: metadata.triage_decision,
        recommended_specialties: summary.recommended_specialties,
        clinical_details: summary.clinical_details
      }
    };

    const result = await createCase(caseData);
    
    if (!result.success || !result.data) {
      log('Failed to create case:', result.error);
      return {
        caseId: '',
        error: result.error || 'Failed to create case'
      };
    }

    log('Case created successfully:', { caseId: result.data.id });

    // Create initial assessment
    try {
      const enrichedMetadata: MessageMetadata = {
        ...metadata,
        key_symptoms: summary.key_symptoms,
        recommended_specialties: summary.recommended_specialties,
        urgency_indicators: summary.clinical_details?.risk_factors || [],
        notes: `Initial Assessment from Chat\n\nDuration: ${summary.duration}\nSeverity: ${summary.severity}\n\nClinical Details:\n${summary.clinical_details?.progression || 'Not specified'}\n\nImpact: ${summary.clinical_details?.impact_on_daily_life || 'Not specified'}`
      };

      await createAssessmentFromMetadata({
        caseId: result.data.id,
        metadata: enrichedMetadata,
        createdBy: 'system',
        createdByType: 'ai'
      });

      log('Initial assessment created for case:', result.data.id);
    } catch (assessmentError) {
      log('Failed to create initial assessment:', assessmentError);
      // Continue with case creation even if assessment fails
    }

    // Update conversation with case ID
    await updateConversation(conversationId, {
      case_id: result.data.id,
      can_create_case: false
    });

    logPerformance('createCaseFromChat', startTime);
    return { caseId: result.data.id };
  } catch (error) {
    log('Error in case creation flow:', error);
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
}> {
  if (!metadata.collected_info) {
    return {
      canCreate: false,
      missingInfo: ['Required information not collected']
    };
  }

  const requiredInfo = [
    'chief_complaint',
    'duration',
    'severity'
  ] as const;

  const missingInfo = requiredInfo.filter(
    info => !metadata.collected_info?.[info]
  );

  return {
    canCreate: missingInfo.length === 0,
    missingInfo
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