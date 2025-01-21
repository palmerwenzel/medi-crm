import { NextResponse } from 'next/server'
import { createCaseSchema } from '@/lib/validations/case'
import { createApiClient, handleApiError } from '@/lib/supabase/api'

/**
 * GET /api/cases
 * List cases based on user role:
 * - Patients see only their own cases (enforced by RLS)
 * - Staff and admins see all cases (enforced by RLS)
 */
export async function GET() {
  try {
    const { supabase, session } = await createApiClient()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: cases, error: casesError } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false })

    if (casesError) throw casesError

    return NextResponse.json(cases)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/cases
 * Create a new case. Access control handled by:
 * - Server-side auth in layout
 * - RLS policies for data access
 */
export async function POST(request: Request) {
  try {
    const { supabase, session } = await createApiClient()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const json = await request.json()
    const validatedData = createCaseSchema.parse(json)

    // Get user role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userData?.role !== 'patient') {
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
          patient_id: session.user.id,
          title: validatedData.title,
          description: validatedData.description,
          status: 'open'
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