/**
 * Server actions for case history management
 * Access control is handled by RLS policies
 */
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import type { 
  CaseHistoryQueryParams, 
  CaseHistoryResponse,
  PaginatedCaseHistoryResponse 
} from '@/lib/validations/case-history'

type ActionResponse<T = void> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Fetch case history with pagination and filtering
 * RLS policies ensure:
 * - Patients see history for their own cases
 * - Staff see history for cases in their department
 * - Admins see all case history
 */
export async function getCaseHistory(
  params: CaseHistoryQueryParams
): Promise<ActionResponse<PaginatedCaseHistoryResponse>> {
  try {
    const supabase = await createClient()
    
    // Start building the query
    let query = supabase
      .from('case_history')
      .select(`
        *,
        actor:users!case_history_actor_id_fkey(
          id,
          first_name,
          last_name,
          role
        )
      `, { count: 'exact' })
      .eq('case_id', params.case_id)
      .order('created_at', { ascending: params.sort_order === 'asc' })
      .range(
        params.offset,
        params.offset + (params.limit || 50) - 1
      )

    // Apply optional filters
    if (params.activity_type) {
      query = query.eq('activity_type', params.activity_type)
    }
    if (params.from_date) {
      query = query.gte('created_at', params.from_date)
    }
    if (params.to_date) {
      query = query.lte('created_at', params.to_date)
    }

    // Execute query
    const { data: history, error: fetchError, count } = await query

    if (fetchError) {
      console.error('Error fetching case history:', fetchError)
      return {
        success: false,
        error: 'Failed to fetch case history',
      }
    }

    // Calculate pagination metadata
    const total = count || 0
    const hasMore = total > params.offset + (history?.length || 0)
    const nextOffset = hasMore ? params.offset + (params.limit || 50) : undefined

    return {
      success: true,
      data: {
        history: history || [],
        total,
        hasMore,
        nextOffset
      }
    }
  } catch (error) {
    console.error('Error in getCaseHistory:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
} 