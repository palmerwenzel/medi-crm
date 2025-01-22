import { NextResponse } from 'next/server'
import { updateCaseSchema, updateCaseInternalNotesSchema, updateCaseMetadataSchema } from '@/lib/validations/case'
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

    if (caseError) {
      return NextResponse.json(
        { error: caseError.message },
        { status: 500 }
      )
    }
    if (!caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(caseData)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/cases/[id]
 * Update a case. Staff and admins can update any case, patients can only update their own.
 * Internal notes can only be updated by staff/admin.
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
    
    // If updating internal notes, validate separately (staff/admin only)
    if ('internal_notes' in json) {
      if (userData.role !== 'staff' && userData.role !== 'admin') {
        return NextResponse.json(
          { error: 'Only staff and admins can update internal notes' },
          { status: 403 }
        )
      }
      const validatedData = updateCaseInternalNotesSchema.parse(json)
      const { data: updatedCase, error: updateError } = await supabase
        .from('cases')
        .update(validatedData)
        .eq('id', params.id)
        .select()
        .single()

      if (updateError) throw updateError
      if (!updatedCase) throw new Error('Case not found')

      return NextResponse.json(updatedCase)
    }

    // If updating metadata, validate separately
    if ('metadata' in json) {
      const validatedData = updateCaseMetadataSchema.parse(json)
      const { data: updatedCase, error: updateError } = await supabase
        .from('cases')
        .update(validatedData)
        .eq('id', params.id)
        .select()
        .single()

      if (updateError) throw updateError
      if (!updatedCase) throw new Error('Case not found')

      return NextResponse.json(updatedCase)
    }

    // For other updates, use the main schema
    const validatedData = updateCaseSchema.parse(json)

    // If assigning to a user, verify they are staff/admin
    if (validatedData.assigned_to) {
      const { data: assignedUser, error: assignedUserError } = await supabase
        .from('users')
        .select('role')
        .eq('id', validatedData.assigned_to)
        .single()

      if (assignedUserError) {
        return NextResponse.json(
          { error: assignedUserError.message },
          { status: 500 }
        )
      }

      if (!assignedUser || (assignedUser.role !== 'staff' && assignedUser.role !== 'admin')) {
        return NextResponse.json(
          { error: 'Cases can only be assigned to staff or admin users' },
          { status: 400 }
        )
      }
    }

    // If user is a patient, verify they own the case
    if (userData.role === 'patient') {
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select('patient_id')
        .eq('id', params.id)
        .single()

      if (caseError) {
        return NextResponse.json(
          { error: caseError.message },
          { status: 500 }
        )
      }
      if (!caseData) {
        return NextResponse.json(
          { error: 'Case not found' },
          { status: 404 }
        )
      }
      if (caseData.patient_id !== user.id) {
        return NextResponse.json(
          { error: 'You can only update your own cases' },
          { status: 403 }
        )
      }
    }

    // Update the case
    const { data: updatedCase, error: updateError } = await supabase
      .from('cases')
      .update(validatedData)
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }
    if (!updatedCase) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedCase)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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