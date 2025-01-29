import { MessageMetadata } from '@/types/domain/chat';
import { CaseAssessment, AssessmentCreatorType } from '@/types/domain/cases';
import { createClient } from '@/utils/supabase/client';
import { DbCaseAssessmentInsert } from '@/types/domain/db';
import { log, logPerformance } from '@/lib/utils/logging';
import { 
  caseAssessmentInsertSchema, 
  caseAssessmentSchema,
  caseAssessmentUpdateSchema
} from '@/lib/validations/case-assessments';

/**
 * Creates a case assessment from metadata with validation
 */
export async function createAssessmentFromMetadata({
  caseId,
  metadata,
  createdBy,
  createdByType
}: {
  caseId: string
  metadata: MessageMetadata
  createdBy: string
  createdByType: AssessmentCreatorType
}): Promise<CaseAssessment> {
  const startTime = performance.now();
  log('Creating assessment from metadata:', {
    caseId,
    createdBy,
    createdByType,
    symptomCount: metadata.key_symptoms?.length || 0,
    specialtyCount: metadata.recommended_specialties?.length || 0,
    hasNotes: Boolean(metadata.notes)
  });

  const supabase = createClient()
  
  // Prepare assessment data
  const assessmentData: DbCaseAssessmentInsert = {
    case_id: caseId,
    created_by: createdBy,
    created_by_type: createdByType,
    key_symptoms: metadata.key_symptoms || [],
    recommended_specialties: metadata.recommended_specialties || [],
    urgency_indicators: metadata.urgency_indicators || [],
    notes: metadata.notes || null,
    status: 'active'
  }

  try {
    // Validate assessment data before insertion
    const validatedData = caseAssessmentInsertSchema.parse(assessmentData);
    log('Assessment data validated successfully');

    const { data: assessment, error } = await supabase
      .from('case_assessments')
      .insert(validatedData)
      .select()
      .single()

    if (error) {
      log('Error creating assessment:', error);
      throw error;
    }

    if (!assessment) {
      log('No assessment returned after creation');
      throw new Error('Failed to create assessment');
    }

    // Validate returned assessment
    const validatedAssessment = caseAssessmentSchema.parse(assessment);
    
    log('Assessment created successfully:', {
      assessmentId: validatedAssessment.id,
      caseId: validatedAssessment.case_id,
      status: validatedAssessment.status
    });

    logPerformance('createAssessmentFromMetadata', startTime);
    return validatedAssessment;
  } catch (error) {
    log('Error in assessment creation:', error);
    throw error;
  }
}

/**
 * Updates an existing case assessment
 */
export async function updateAssessment(
  assessmentId: string,
  updates: Partial<DbCaseAssessmentInsert>
): Promise<CaseAssessment> {
  const startTime = performance.now();
  log('Updating assessment:', { assessmentId, updates });

  try {
    // Validate update data
    const validatedUpdates = caseAssessmentUpdateSchema.parse(updates);
    log('Assessment update data validated successfully');

    const supabase = createClient();
    const { data: assessment, error } = await supabase
      .from('case_assessments')
      .update(validatedUpdates)
      .eq('id', assessmentId)
      .select()
      .single();

    if (error) {
      log('Error updating assessment:', error);
      throw error;
    }

    if (!assessment) {
      log('No assessment returned after update');
      throw new Error('Failed to update assessment');
    }

    // Validate returned assessment
    const validatedAssessment = caseAssessmentSchema.parse(assessment);

    log('Assessment updated successfully:', {
      assessmentId: validatedAssessment.id,
      status: validatedAssessment.status
    });

    logPerformance('updateAssessment', startTime);
    return validatedAssessment;
  } catch (error) {
    log('Error in assessment update:', error);
    throw error;
  }
}

/**
 * Supersedes an existing assessment
 * Used when a new assessment replaces an old one
 */
export async function supersedePreviousAssessment(
  assessmentId: string
): Promise<void> {
  const startTime = performance.now();
  log('Superseding assessment:', { assessmentId });

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('case_assessments')
      .update({ status: 'superseded' })
      .eq('id', assessmentId);

    if (error) {
      log('Error superseding assessment:', error);
      throw error;
    }

    log('Assessment superseded successfully');
    logPerformance('supersedePreviousAssessment', startTime);
  } catch (error) {
    log('Error in assessment supersede:', error);
    throw error;
  }
} 