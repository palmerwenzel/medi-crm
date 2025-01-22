import { NextResponse } from 'next/server'
import { updateCaseSchema } from '@/lib/validations/case'
import { createApiClient, handleApiError } from '@/lib/supabase/api'

/**
 * GET /api/cases/[id]
 * Get a specific case. Access controlled by RLS policies.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase } = await createApiClient()

    // Get the case (RLS will ensure user has access)
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('*')
      .eq('id', params.id)
      .single()

    if (caseError) throw caseError
    if (!caseData) throw new Error('Case not found')

    return NextResponse.json(caseData)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/cases/[id]
 * Update a case. Staff and admins can update any case, patients can only update their own.
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, user } = await createApiClient()

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError) throw userError

    // Parse and validate request body
    const json = await request.json()
    const validatedData = updateCaseSchema.parse(json)

    // If user is a patient, verify they own the case
    if (userData.role === 'patient') {
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select('patient_id')
        .eq('id', params.id)
        .single()

      if (caseError) throw caseError
      if (!caseData) throw new Error('Case not found')
      if (caseData.patient_id !== user.id) {
        throw new Error('You can only update your own cases')
      }
    }

    // Update the case
    const { data: updatedCase, error: updateError } = await supabase
      .from('cases')
      .update(validatedData)
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) throw updateError
    if (!updatedCase) throw new Error('Case not found')

    return NextResponse.json(updatedCase)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/cases/[id]
 * Delete a case. Only staff and admins can delete cases.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, user } = await createApiClient()

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError) throw userError
    if (userData.role === 'patient') {
      throw new Error('Only staff and admins can delete cases')
    }

    // Delete the case
    const { error: deleteError } = await supabase
      .from('cases')
      .delete()
      .eq('id', params.id)

    if (deleteError) throw deleteError

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error)
  }
} 