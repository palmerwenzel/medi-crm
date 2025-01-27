import { NextResponse } from 'next/server'
import { createApiClient, createApiError, handleApiError } from '@/utils/supabase/api'
import { casesInsertSchema } from '@/lib/validations/cases'
import type { CaseQueryParams, CaseSortField } from '@/types/domain/cases'

// Required query parameters that must always have values
interface RequiredQueryParams {
  limit: number
  offset: number
  sort_by: CaseSortField
  sort_order: 'asc' | 'desc'
}

// Default query parameters
const DEFAULT_QUERY_PARAMS: RequiredQueryParams = {
  limit: 20,
  offset: 0,
  sort_by: 'created_at',
  sort_order: 'desc'
}

/**
 * GET /api/cases
 * List cases based on user role with pagination and filtering
 * Access control handled by RLS policies
 */
export async function GET(request: Request) {
  try {
    const { supabase, user, role } = await createApiClient()
    const searchParams = new URL(request.url).searchParams
    
    // Parse and validate required query parameters
    const requiredParams: RequiredQueryParams = {
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : DEFAULT_QUERY_PARAMS.limit,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : DEFAULT_QUERY_PARAMS.offset,
      sort_by: (searchParams.get('sort_by') as CaseSortField) || DEFAULT_QUERY_PARAMS.sort_by,
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || DEFAULT_QUERY_PARAMS.sort_order
    }

    // Parse optional filter parameters
    const filterParams: Partial<CaseQueryParams> = {
      status: searchParams.get('status') as CaseQueryParams['status'] || undefined,
      priority: searchParams.get('priority') as CaseQueryParams['priority'] || undefined,
      category: searchParams.get('category') as CaseQueryParams['category'] || undefined,
      department: searchParams.get('department') as CaseQueryParams['department'] || undefined,
      assigned_to: searchParams.get('assigned_to') || undefined,
      search: searchParams.get('search') || undefined
    }

    // Build query with role-based filtering
    let query = supabase
      .from('cases')
      .select('*', { count: 'exact' })

    // Apply role-based filtering
    if (role === 'patient') {
      query = query.eq('patient_id', user.id)
    } else if (role === 'staff') {
      query = query.eq('assigned_to', user.id)
    }

    // Apply optional filters
    if (filterParams.status) query = query.eq('status', filterParams.status)
    if (filterParams.priority) query = query.eq('priority', filterParams.priority)
    if (filterParams.category) query = query.eq('category', filterParams.category)
    if (filterParams.department) query = query.eq('department', filterParams.department)
    if (filterParams.assigned_to) query = query.eq('assigned_to', filterParams.assigned_to)
    if (filterParams.search) query = query.ilike('title', `%${filterParams.search}%`)

    // Execute query with sorting and pagination
    const { data: cases, error: casesError, count } = await query
      .order(requiredParams.sort_by, { ascending: requiredParams.sort_order === 'asc' })
      .range(
        requiredParams.offset,
        requiredParams.offset + requiredParams.limit - 1
      )

    if (casesError) {
      throw createApiError(500, casesError.message)
    }

    return NextResponse.json({
      cases: cases || [],
      total: count || 0,
      hasMore: count ? requiredParams.offset + requiredParams.limit < count : false
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/cases
 * Create a new case
 * Access control handled by RLS policies
 */
export async function POST(request: Request) {
  try {
    const { supabase, user, role } = await createApiClient()

    // Parse and validate request body
    const json = await request.json()
    const validatedData = casesInsertSchema.parse(json)

    // Only patients can create cases (enforced by RLS)
    if (role !== 'patient') {
      return NextResponse.json(
        { error: 'Only patients can create cases' },
        { status: 403 }
      )
    }

    // Create the case (RLS will enforce access rules)
    const { data: newCase, error: createError } = await supabase
      .from('cases')
      .insert({
        patient_id: user.id,
        title: validatedData.title,
        description: validatedData.description,
        status: 'open',
        priority: validatedData.priority || 'medium',
        category: validatedData.category || 'general',
        department: validatedData.department,
        metadata: validatedData.metadata || {},
        internal_notes: null,
        attachments: validatedData.attachments || []
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

    return NextResponse.json(newCase, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
} 