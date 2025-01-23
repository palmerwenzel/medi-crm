/**
 * Server actions for case management
 * Access control is handled by RLS policies
 */

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createCaseSchema, type CreateCaseInput, type CaseResponse } from '@/lib/validations/case'

type ActionResponse<T = void> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Fetch cases for the current user
 * RLS policies ensure:
 * - Patients see their own cases
 * - Staff see cases in their department
 * - Admins see all cases
 */
export async function getCases(): Promise<ActionResponse<CaseResponse[]>> {
  try {
    const supabase = await createClient()
    
    // Query cases - RLS will filter based on user role
    const { data: cases, error: fetchError } = await supabase
      .from('cases')
      .select('*, patient:users(first_name, last_name)')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching cases:', fetchError)
      return {
        success: false,
        error: 'Failed to fetch cases',
      }
    }

    return {
      success: true,
      data: cases,
    }
  } catch (error) {
    console.error('Error in getCases:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Create a new case
 * RLS policies ensure only patients can create cases
 */
export async function createCase(input: CreateCaseInput): Promise<ActionResponse> {
  try {
    // Validate input
    const validatedInput = createCaseSchema.parse(input)
    
    const supabase = await createClient()
    
    // Create case - RLS will verify the user is a patient
    const { error: createError } = await supabase
      .from('cases')
      .insert(validatedInput)

    if (createError) {
      console.error('Error creating case:', createError)
      return {
        success: false,
        error: 'Failed to create case',
      }
    }

    revalidatePath('/dashboard/cases')
    return { success: true }
  } catch (error) {
    console.error('Error in createCase:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Update case statuses
 * RLS policies ensure:
 * - Staff can update cases in their department
 * - Admins can update any case
 */
export async function updateCaseStatuses(
  caseIds: string[],
  status: 'open' | 'in_progress' | 'resolved'
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    
    // Update cases - RLS will verify user has permission
    const { error: updateError } = await supabase
      .from('cases')
      .update({ status })
      .in('id', caseIds)

    if (updateError) {
      console.error('Error updating case statuses:', updateError)
      return {
        success: false,
        error: 'Failed to update cases',
      }
    }

    revalidatePath('/dashboard/cases')
    return { success: true }
  } catch (error) {
    console.error('Error in updateCaseStatuses:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Assign cases to staff
 * RLS policies ensure:
 * - Staff can assign cases in their department
 * - Admins can assign any case
 */
export async function assignCases(
  caseIds: string[],
  staffId: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    
    // Assign cases - RLS will verify user has permission
    const { error: assignError } = await supabase
      .from('cases')
      .update({ assigned_to: staffId })
      .in('id', caseIds)

    if (assignError) {
      console.error('Error assigning cases:', assignError)
      return {
        success: false,
        error: 'Failed to assign cases',
      }
    }

    revalidatePath('/dashboard/cases')
    return { success: true }
  } catch (error) {
    console.error('Error in assignCases:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
} 