/**
 * Server actions for case management
 * Access control is handled by RLS policies
 */

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { 
  createCaseSchema, 
  type CreateCaseInput, 
  type CaseResponse,
  type CaseQueryParams,
  type PaginatedCaseResponse,
  caseQuerySchema
} from '@/lib/validations/case'

type ActionResponse<T = void> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Fetch cases for the current user with pagination and filtering
 * RLS policies ensure:
 * - Patients see their own cases
 * - Staff see cases in their department
 * - Admins see all cases
 */
export async function getCases(params?: Partial<CaseQueryParams>): Promise<ActionResponse<PaginatedCaseResponse>> {
  try {
    const supabase = await createClient()
    
    // Validate and parse query parameters
    const validatedParams = caseQuerySchema.parse({
      limit: 20,
      offset: 0,
      sort_by: 'created_at',
      sort_order: 'desc',
      ...params
    })

    // Start building the query
    let query = supabase
      .from('cases')
      .select(`
        *,
        patient:users!cases_patient_id_fkey(id, first_name, last_name),
        assigned_to:users!cases_assigned_to_fkey(id, first_name, last_name)
      `, { count: 'exact' })

    // Apply filters if provided
    if (validatedParams.status) {
      query = query.eq('status', validatedParams.status)
    }
    if (validatedParams.priority) {
      query = query.eq('priority', validatedParams.priority)
    }
    if (validatedParams.category) {
      query = query.eq('category', validatedParams.category)
    }
    if (validatedParams.department) {
      query = query.eq('department', validatedParams.department)
    }
    if (validatedParams.assigned_to !== undefined) {
      query = query.eq('assigned_to', validatedParams.assigned_to)
    }
    if (validatedParams.search) {
      query = query.or(`title.ilike.%${validatedParams.search}%,description.ilike.%${validatedParams.search}%`)
    }

    // Apply sorting and pagination
    const { data: cases, error: fetchError, count } = await query
      .order(validatedParams.sort_by, { ascending: validatedParams.sort_order === 'asc' })
      .range(
        validatedParams.offset,
        validatedParams.offset + validatedParams.limit - 1
      )

    if (fetchError) {
      console.error('Error fetching cases:', fetchError)
      return {
        success: false,
        error: 'Failed to fetch cases',
      }
    }

    // Calculate pagination metadata
    const total = count || 0
    const hasMore = total > validatedParams.offset + cases.length
    const nextOffset = hasMore ? validatedParams.offset + validatedParams.limit : undefined

    return {
      success: true,
      data: {
        cases: cases || [],
        total,
        hasMore,
        nextOffset
      }
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
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user:', userError)
      return {
        success: false,
        error: 'Not authenticated',
      }
    }
    
    // Create case with patient_id set to current user
    const { error: createError } = await supabase
      .from('cases')
      .insert({
        ...validatedInput,
        patient_id: user.id,
        status: 'open', // Set default status
      })

    if (createError) {
      console.error('Error creating case:', createError)
      return {
        success: false,
        error: 'Failed to create case',
      }
    }

    revalidatePath('/cases')
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

    revalidatePath('/cases')
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

    revalidatePath('/cases')
    return { success: true }
  } catch (error) {
    console.error('Error in assignCases:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
} 