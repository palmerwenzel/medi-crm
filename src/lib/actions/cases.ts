/**
 * Server actions for case management
 * Uses server-side validation and role checks
 */

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { verifyRoleOrRedirect } from '@/lib/auth/role-check'
import { createCaseSchema, type CreateCaseInput, type CaseResponse } from '@/lib/validations/case'

type ActionResponse<T = void> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Fetch cases for the current user based on their role
 * - Patients see their own cases
 * - Staff and admins see all cases
 */
export async function getCases(): Promise<ActionResponse<CaseResponse[]>> {
  try {
    // Get user role
    const role = await verifyRoleOrRedirect(['patient', 'staff', 'admin'])
    
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    // Build query based on role
    let query = supabase
      .from('cases')
      .select('*, patient:users(first_name, last_name)')
      .order('created_at', { ascending: false })

    // Patients can only see their own cases
    if (role === 'patient') {
      query = query.eq('patient_id', user.id)
    }

    const { data: cases, error: fetchError } = await query

    if (fetchError) {
      console.error('Failed to fetch cases:', fetchError)
      return {
        success: false,
        error: 'Failed to fetch cases',
      }
    }

    return {
      success: true,
      data: cases,
    }
  } catch (err) {
    console.error('Fetch cases error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch cases',
    }
  }
}

export async function createCase(input: CreateCaseInput): Promise<ActionResponse> {
  try {
    // Verify user is a patient
    const role = await verifyRoleOrRedirect(['patient'])

    // Validate input
    const result = createCaseSchema.safeParse(input)
    if (!result.success) {
      return {
        success: false,
        error: 'Invalid case data',
      }
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    // Create case
    const { data: caseData, error: createError } = await supabase
      .from('cases')
      .insert({
        ...result.data,
        patient_id: user.id,
        status: 'open',
      })
      .select()
      .single()

    if (createError) {
      console.error('Failed to create case:', createError)
      return {
        success: false,
        error: 'Failed to create case',
      }
    }

    // Revalidate cases list
    revalidatePath('/patient/cases')

    return {
      success: true,
      data: caseData,
    }
  } catch (err) {
    console.error('Create case error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create case',
    }
  }
}

/**
 * Update status for multiple cases
 * Only staff and admin can perform bulk updates
 */
export async function updateCaseStatuses(
  caseIds: string[],
  status: 'open' | 'in_progress' | 'resolved'
): Promise<ActionResponse> {
  try {
    // Verify user has permission
    const role = await verifyRoleOrRedirect(['staff', 'admin'])
    
    const supabase = await createClient()
    
    // Update all cases
    const { error } = await supabase
      .from('cases')
      .update({ status })
      .in('id', caseIds)
    
    if (error) {
      console.error('Failed to update case statuses:', error)
      return {
        success: false,
        error: 'Failed to update case statuses',
      }
    }

    // Revalidate cases pages
    revalidatePath('/cases')
    revalidatePath('/dashboard/cases')

    return {
      success: true,
    }
  } catch (err) {
    console.error('Update case statuses error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update case statuses',
    }
  }
}

/**
 * Assign multiple cases to a staff member
 * Only staff and admin can perform bulk assignments
 */
export async function assignCases(
  caseIds: string[],
  staffId: string
): Promise<ActionResponse> {
  try {
    // Verify user has permission
    const role = await verifyRoleOrRedirect(['staff', 'admin'])
    
    const supabase = await createClient()
    
    // First verify the staff member exists
    const { data: staffMember, error: staffError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', staffId)
      .single()
    
    if (staffError || !staffMember || staffMember.role !== 'staff') {
      return {
        success: false,
        error: 'Invalid staff member',
      }
    }
    
    // Update all cases
    const { error } = await supabase
      .from('cases')
      .update({ assigned_to: staffId })
      .in('id', caseIds)
    
    if (error) {
      console.error('Failed to assign cases:', error)
      return {
        success: false,
        error: 'Failed to assign cases',
      }
    }

    // Revalidate cases pages
    revalidatePath('/cases')
    revalidatePath('/dashboard/cases')

    return {
      success: true,
    }
  } catch (err) {
    console.error('Assign cases error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to assign cases',
    }
  }
} 