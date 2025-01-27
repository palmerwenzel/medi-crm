/**
 * Server actions for case management
 * Access control is handled by RLS policies
 */

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { 
  type CreateCaseInput, 
  type CaseResponse,
  type CaseQueryParams,
  type PaginatedCaseResponse
} from '@/types/domain/cases'
import { caseQuerySchema } from '@/lib/validations/cases'
import { uploadFile, removeFile } from './files'

type ActionResponse<T = void> = {
  success: boolean
  data?: T
  error?: string
}

type FileUploadResult = {
  success: boolean
  url?: string
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
      .order(validatedParams.sort_by || 'created_at', { ascending: validatedParams.sort_order === 'asc' })
      .range(
        validatedParams.offset || 0,
        (validatedParams.offset || 0) + (validatedParams.limit || 20) - 1
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
    const currentOffset = validatedParams.offset || 0
    const currentLimit = validatedParams.limit || 20
    const hasMore = total > currentOffset + cases.length
    const nextOffset = hasMore ? currentOffset + currentLimit : undefined

    return {
      success: true,
      data: {
        cases,
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
 * Creates a new case with optional file attachments
 */
export async function createCase(
  data: CreateCaseInput & { files?: File[] }
): Promise<ActionResponse<CaseResponse>> {
  try {
    const supabase = await createClient()
    const { files, ...caseData } = data

    // Get authenticated user data
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return {
        success: false,
        error: 'You must be logged in to create a case'
      }
    }

    // Verify user is a patient by checking database role
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (dbError || !userData) {
      return {
        success: false,
        error: 'User not found'
      }
    }

    if (userData.role !== 'patient') {
      return {
        success: false,
        error: 'Only patients can create cases'
      }
    }

    // Create case first to get the ID
    const { data: newCase, error: createError } = await supabase
      .from('cases')
      .insert({
        ...caseData,
        patient_id: user.id,
        attachments: [],
        status: 'open'
      })
      .select(`
        *,
        patient:users!cases_patient_id_fkey(first_name, last_name),
        assigned_to:users!cases_assigned_to_fkey(first_name, last_name)
      `)
      .single()

    if (createError) {
      console.error('Create case error:', createError)
      throw createError
    }
    if (!newCase) throw new Error('Failed to create case')

    // Upload files if provided
    if (files?.length) {
      const uploadPromises = files.map((file: File) => uploadFile(file, newCase.id))
      const uploadResults = await Promise.all(uploadPromises)
      
      // Filter successful uploads and get URLs
      const uploadedUrls = uploadResults
        .filter((result: FileUploadResult) => result.success && result.url)
        .map((result: FileUploadResult) => result.url!)

      // Update case with attachment URLs
      if (uploadedUrls.length) {
        const { error: updateError } = await supabase
          .from('cases')
          .update({ attachments: uploadedUrls })
          .eq('id', newCase.id)

        if (updateError) throw updateError
      }
    }

    revalidatePath('/cases')
    return { success: true, data: newCase }
  } catch (error) {
    console.error('Create case error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create case'
    }
  }
}

/**
 * Updates an existing case, including file attachments
 */
export async function updateCase(
  id: string,
  data: {
    files?: File[]
    removedFiles?: string[]
    updates: Partial<CaseResponse>
  }
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { files, removedFiles, updates } = data

    // Get current case data
    const { data: currentCase, error: fetchError } = await supabase
      .from('cases')
      .select('attachments')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError
    if (!currentCase) throw new Error('Case not found')

    // Handle file removals
    if (removedFiles?.length) {
      await Promise.all(removedFiles.map(path => removeFile(path)))
    }

    // Upload new files
    let newUrls: string[] = []
    if (files?.length) {
      const uploadPromises = files.map(file => uploadFile(file, id))
      const uploadResults = await Promise.all(uploadPromises)
      
      newUrls = uploadResults
        .filter(result => result.success && result.url)
        .map(result => result.url!)
    }

    // Update case with new attachment list
    const currentUrls = currentCase.attachments || []
    const remainingUrls = removedFiles?.length
      ? currentUrls.filter((url: string) => !removedFiles.includes(url))
      : currentUrls

    const { error: updateError } = await supabase
      .from('cases')
      .update({
        ...updates,
        attachments: [...remainingUrls, ...newUrls]
      })
      .eq('id', id)

    if (updateError) throw updateError

    revalidatePath('/cases')
    return { success: true }
  } catch (error) {
    console.error('Update case error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update case'
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