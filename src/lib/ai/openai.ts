'use server'

import OpenAI from 'openai';
import type { OpenAIRole } from '@/types/domain/roles';
import type { TriageDecision, CollectedMedicalInfo } from '@/types/domain/chat';
import { log, logPerformance } from '@/lib/utils/logging';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Message {
  role: OpenAIRole;
  content: string;
}

interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

const DEFAULT_MODEL = 'gpt-4-turbo-preview' as const;

const DEFAULT_OPTIONS: ChatOptions = {
  temperature: 0.7,
  maxTokens: 1000,
  model: DEFAULT_MODEL
};

export async function generateChatResponse(
  messages: Message[],
  options: ChatOptions = {}
): Promise<string> {
  const startTime = performance.now();
  const { temperature, maxTokens, model = DEFAULT_MODEL } = { ...DEFAULT_OPTIONS, ...options };

  log('Generating chat response:', {
    model,
    temperature,
    maxTokens,
    messageCount: messages.length
  });

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      log('No response from OpenAI');
      throw new Error('No response from OpenAI');
    }

    log('Generated response length:', response.length);
    logPerformance('generateChatResponse', startTime);
    return response;
  } catch (error) {
    log('Error generating chat response:', error);
    throw error;
  }
}

export async function extractStructuredData(content: string): Promise<CollectedMedicalInfo> {
  const startTime = performance.now();
  log('Extracting structured data from content length:', content.length);

  const messages: Message[] = [
    {
      role: 'system',
      content: `You are a medical data extraction specialist tasked with extracting structured medical information from patient conversations. Your goal is to prepare data for case assessment and triage.

Return a JSON object with two sections - public medical data and internal assessment metrics:

{
  "domain_data": {
    "title": "Brief (5-7 words) clinical summary using standard medical terminology",
    "description": "2-3 sentence clinical assessment following SOAP note format",
    "chief_complaint": "Primary presenting symptom or concern (required)",
    "key_symptoms": [
      "Array of distinct symptoms in clinical terms",
      "Include both primary and secondary symptoms",
      "Use standardized medical terminology"
    ],
    "duration": "Standardized duration (e.g., '3 days', '2 weeks')",
    "severity": "One of: 'Mild', 'Moderate', 'Severe', or 'Critical'",
    "existing_provider": "Current provider name or null",
    "recommended_specialties": [
      "Medical specialties based on symptoms and clinical assessment"
    ],
    "urgency_indicators": [
      "Clinical red flags",
      "High-risk symptoms",
      "Concerning vital signs or measurements",
      "Risk factors requiring immediate attention"
    ],
    "clinical_details": {
      "progression": "How symptoms have evolved over time",
      "impact_on_daily_life": "Functional impact assessment",
      "previous_treatments": ["Prior interventions", "Current medications"],
      "medical_history": ["Relevant past conditions", "Risk factors"],
      "vital_signs": {
        "reported_temperature": "If mentioned",
        "reported_blood_pressure": "If mentioned",
        "other_vitals": "Any other reported measurements"
      }
    }
  },
  "internal_metrics": {
    "field_confidence": {
      "chief_complaint": 0.0-1.0,
      "key_symptoms": 0.0-1.0,
      "duration": 0.0-1.0,
      "severity": 0.0-1.0,
      "urgency": 0.0-1.0,
      "clinical_details": 0.0-1.0
    },
    "missing_critical_info": [
      "List required fields that are missing",
      "Note any vital information gaps"
    ],
    "uncertainty_flags": [
      "Areas needing clinical clarification",
      "Ambiguous symptoms or timeline"
    ],
    "follow_up_questions": [
      "Specific clinical questions to improve assessment",
      "Questions to clarify risk factors"
    ],
    "triage_hints": {
      "emergency_indicators": ["Immediate action needed if present"],
      "urgent_indicators": ["Require prompt but not immediate care"],
      "routine_indicators": ["Can be handled in normal office hours"]
    }
  }
}

Clinical Guidelines:
1. Title & Description:
   - Use standard medical terminology
   - Follow SOAP note format for description
   - Be concise but clinically precise

2. Symptoms & Assessment:
   - List symptoms in order of clinical significance
   - Use standardized medical terms
   - Note any concerning combinations
   - Include relevant negatives if mentioned

3. Urgency Assessment:
   - Flag any emergency indicators
   - Note time-sensitive symptoms
   - Consider risk factors
   - Evaluate symptom progression

4. Specialty Recommendations:
   - Base on symptom clusters
   - Consider comorbidities
   - Include both primary and consulting specialties

5. Confidence Scoring:
   - Score based on clinical clarity
   - Consider information completeness
   - Flag diagnostic uncertainties
   - Note missing critical data

Example Response:
{
  "domain_data": {
    "title": "Acute Migraine with Visual Aura",
    "description": "Patient presents with severe throbbing headache and scintillating scotoma for 3 days. Associated symptoms include photophobia and nausea. No prior history of similar intensity.",
    "chief_complaint": "Severe migraine headache",
    "key_symptoms": ["Throbbing headache", "Visual aura", "Photophobia", "Nausea"],
    "duration": "3 days",
    "severity": "Severe",
    "existing_provider": null,
    "recommended_specialties": ["Neurology", "Ophthalmology"],
    "urgency_indicators": ["Unprecedented severity", "Persistent visual symptoms", "Duration > 72 hours"],
    "clinical_details": {
      "progression": "Symptoms worsening over 72 hours",
      "impact_on_daily_life": "Unable to work or perform daily activities",
      "previous_treatments": ["OTC pain medications - ineffective"],
      "medical_history": ["No prior migraines of this severity"],
      "vital_signs": {}
    }
  },
  "internal_metrics": {
    "field_confidence": {
      "chief_complaint": 0.9,
      "key_symptoms": 0.8,
      "duration": 1.0,
      "severity": 0.9,
      "urgency": 0.7,
      "clinical_details": 0.6
    },
    "missing_critical_info": [
      "Prior migraine history details",
      "Current medication list",
      "Family history"
    ],
    "uncertainty_flags": [
      "Exact nature of visual changes",
      "Response to previous medications"
    ],
    "follow_up_questions": [
      "Have you experienced similar headaches before?",
      "Can you describe the visual changes in detail?",
      "What medications have you tried and their effects?"
    ],
    "triage_hints": {
      "urgent_indicators": [
        "Severe persistent headache",
        "New visual symptoms",
        "Treatment resistant"
      ]
    }
  }
}`
    },
    {
      role: 'user',
      content
    }
  ];

  try {
    const response = await generateChatResponse(messages, {
      temperature: 0,
      model: DEFAULT_MODEL
    });

    const fullResponse = JSON.parse(response);
    
    log('Extracted structured data:', {
      title: fullResponse.domain_data.title,
      symptoms: fullResponse.domain_data.key_symptoms?.length,
      hasUrgencyIndicators: Boolean(fullResponse.domain_data.urgency_indicators?.length)
    });
    
    log('Extraction metrics:', {
      confidence: fullResponse.internal_metrics.field_confidence,
      missingFields: fullResponse.internal_metrics.missing_critical_info?.length,
      uncertaintyFlags: fullResponse.internal_metrics.uncertainty_flags?.length,
      followUpQuestions: fullResponse.internal_metrics.follow_up_questions?.length
    });
    
    logPerformance('extractStructuredData', startTime);
    return fullResponse.domain_data;
  } catch (error) {
    log('Error extracting structured data:', error);
    throw error;
  }
}

export async function makeTriageDecision(
  messages: Message[]
): Promise<{ decision: TriageDecision; confidence: number; reasoning: string }> {
  const startTime = performance.now();
  log('Making triage decision from messages:', messages.length);

  const systemPrompt = {
    role: 'system' as const,
    content: `Analyze the conversation and make a triage decision. Return a JSON object with:
    - decision: One of ["EMERGENCY", "URGENT", "NON_URGENT", "SELF_CARE"]
      EMERGENCY: Life-threatening conditions requiring immediate attention
      URGENT: Serious but not immediately life-threatening
      NON_URGENT: Can be handled during regular office hours
      SELF_CARE: Can be managed with self-care measures and guidance
    - confidence: Number between 0 and 1
    - reasoning: Brief explanation of the decision`
  };

  try {
    const response = await generateChatResponse([systemPrompt, ...messages], {
      temperature: 0,
      model: DEFAULT_MODEL
    });

    const result = JSON.parse(response);
    
    log('Triage decision:', {
      decision: result.decision,
      confidence: result.confidence,
      reasoningLength: result.reasoning?.length
    });
    
    logPerformance('makeTriageDecision', startTime);
    return result;
  } catch (error) {
    log('Error making triage decision:', error);
    throw error;
  }
} 