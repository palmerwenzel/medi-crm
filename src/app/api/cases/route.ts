import { NextResponse } from 'next/server'
import { createCaseSchema } from '@/lib/validations/case'
import { createApiClient, handleApiError } from '@/utils/supabase/api'

/**
 * GET /api/cases
 * List cases based on user role
 * Access control handled by RLS policies
 */
export async function GET() {
  try {
    const { supabase } = await createApiClient()

    const { data: cases, error: casesError } = await supabase
      .from('cases')
      .select('*, patient:users(first_name, last_name)')
      .order('created_at', { ascending: false })

    if (casesError) {
      return NextResponse.json(
        { error: casesError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(cases)
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