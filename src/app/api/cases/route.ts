import { NextResponse } from 'next/server'
import { createCaseSchema, caseQuerySchema } from '@/lib/validations/case'
import { createApiClient, handleApiError } from '@/utils/supabase/api'

/**
 * GET /api/cases
 * List cases based on user role with pagination and filtering
 * Access control handled by RLS policies
 */
export async function GET(request: Request) {
  try {
    const { supabase } = await createApiClient()
    const { searchParams } = new URL(request.url)

    // Parse and validate query parameters
    const queryParams = caseQuerySchema.parse({
      limit: searchParams.has('limit') ? Number(searchParams.get('limit')) : 20,
      offset: searchParams.has('offset') ? Number(searchParams.get('offset')) : 0,
      status: searchParams.get('status') || undefined,
      priority: searchParams.get('priority') || undefined,
      category: searchParams.get('category') || undefined,
      department: searchParams.get('department') || undefined,
      assigned_to: searchParams.get('assigned_to') || undefined,
      search: searchParams.get('search') || undefined,
      sort_by: (searchParams.get('sort_by') as any) || 'created_at',
      sort_order: (searchParams.get('sort_order') as any) || 'desc'
    })

    // Build query with filters
    let query = supabase
      .from('cases')
      .select('*, patient:users(first_name, last_name)', { count: 'exact' })

    // Apply filters
    if (queryParams.status) {
      query = query.eq('status', queryParams.status)
    }
    if (queryParams.priority) {
      query = query.eq('priority', queryParams.priority)
    }
    if (queryParams.category) {
      query = query.eq('category', queryParams.category)
    }
    if (queryParams.department) {
      query = query.eq('department', queryParams.department)
    }
    if (queryParams.assigned_to !== undefined) {
      query = query.eq('assigned_to', queryParams.assigned_to)
    }
    if (queryParams.search) {
      query = query.or(`title.ilike.%${queryParams.search}%,description.ilike.%${queryParams.search}%`)
    }

    // Execute query with sorting and pagination
    const { data: cases, error: casesError, count } = await query
      .order(queryParams.sort_by, { ascending: queryParams.sort_order === 'asc' })
      .range(
        queryParams.offset,
        queryParams.offset + queryParams.limit - 1
      )

    if (casesError) {
      return NextResponse.json(
        { error: casesError.message },
        { status: 500 }
      )
    }

    // Calculate pagination metadata
    const total = count || 0
    const hasMore = total > queryParams.offset + (cases?.length || 0)
    const nextOffset = hasMore ? queryParams.offset + queryParams.limit : undefined

    return NextResponse.json({
      cases: cases || [],
      total,
      hasMore,
      nextOffset
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
      .insert([
        {
          patient_id: user.id,
          title: validatedData.title,
          description: validatedData.description,
          status: 'open',
          priority: validatedData.priority || 'medium',
          category: validatedData.category || 'general',
          metadata: validatedData.metadata || {},
          internal_notes: null,
          attachments: []
        }
      ])
      .select()
      .single()

    if (createError) throw createError
    if (!newCase) throw new Error('Failed to create case')

    return NextResponse.json(newCase, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
} 