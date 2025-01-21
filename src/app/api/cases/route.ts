import { NextResponse } from 'next/server'
import { createCaseSchema } from '@/lib/validations/case'
import { createApiClient, handleApiError } from '@/lib/supabase/api'

/**
 * GET /api/cases
 * List cases based on user role:
 * - Patients see only their own cases
 * - Staff and admins see all cases
 */
export async function GET() {
  try {
    const { supabase } = await createApiClient()

    // Get cases (RLS will automatically filter based on user role)
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
 * Create a new case. Only patients can create cases.
 */
export async function POST(request: Request) {
  try {
    // Get client and session
    const { supabase, session } = await createApiClient()
    
    if (!session?.user?.id) {
      console.error('No session or user ID found')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userError) {
      console.error('Error fetching user role:', userError)
      throw userError
    }

    if (!userData?.role) {
      console.error('No user role found for ID:', session.user.id)
      throw new Error('User role not found')
    }

    if (userData.role !== 'patient') {
      console.error('Invalid role for case creation:', userData.role)
      throw new Error('Only patients can create cases')
    }

    // Parse and validate request body
    const json = await request.json()
    const validatedData = createCaseSchema.parse(json)

    // Create the case
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

    if (createError) {
      console.error('Error creating case:', createError)
      throw createError
    }

    if (!newCase) {
      console.error('No case data returned after creation')
      throw new Error('Failed to create case')
    }

    return NextResponse.json(newCase, { status: 201 })
  } catch (error) {
    console.error('POST /api/cases error:', error)
    return handleApiError(error)
  }
} 