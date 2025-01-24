import { NextResponse } from 'next/server'
import { createApiClient, createApiError, handleApiError } from '@/utils/supabase/api'
import { createCaseSchema } from '@/lib/validations/case'

// Default query parameters
const DEFAULT_QUERY_PARAMS = {
  limit: 20,
  offset: 0,
  sort_by: 'created_at' as const,
  sort_order: 'desc' as const
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
    
    // Parse and validate query parameters
    const queryParams = {
      ...DEFAULT_QUERY_PARAMS,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : DEFAULT_QUERY_PARAMS.limit,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : DEFAULT_QUERY_PARAMS.offset,
      sort_by: searchParams.get('sort_by') || DEFAULT_QUERY_PARAMS.sort_by,
      sort_order: (searchParams.get('sort_order') || DEFAULT_QUERY_PARAMS.sort_order) as 'asc' | 'desc'
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
    // Admin sees all cases

    // Execute query with sorting and pagination
    const { data: cases, error: casesError, count } = await query
      .order(queryParams.sort_by as string, { ascending: queryParams.sort_order === 'asc' })
      .range(
        queryParams.offset,
        queryParams.offset + queryParams.limit - 1
      )

    if (casesError) {
      throw createApiError(500, casesError.message)
    }

    return NextResponse.json({
      cases: cases || [],
      total: count || 0,
      hasMore: count ? queryParams.offset + queryParams.limit < count : false
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
    const validatedData = createCaseSchema.parse(json)

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