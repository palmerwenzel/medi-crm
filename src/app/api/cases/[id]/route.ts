import { NextResponse } from 'next/server'
import { updateCaseSchema, updateCaseInternalNotesSchema, updateCaseMetadataSchema } from '@/lib/validations/case'
import { createApiClient, createApiError, handleApiError } from '@/utils/supabase/api'

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
      throw createApiError(500, caseError.message)
    }
    if (!caseData) {
      throw createApiError(404, 'Case not found')
    }

    return NextResponse.json(caseData)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/cases/[id]
 * Update a case. Access control handled by RLS policies.
 * Internal notes can only be updated by staff/admin.
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, user, role } = await createApiClient()

    // Parse and validate request body
    const json = await request.json()
    const validatedData = updateCaseSchema.parse(json)

    // Staff/admin check for internal notes
    if (validatedData.internal_notes !== undefined && role === 'patient') {
      throw createApiError(403, 'Only staff and admins can update internal notes')
    }

    // Update the case (RLS will enforce access rules)
    const { data: updatedCase, error: updateError } = await supabase
      .from('cases')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      throw createApiError(500, 'Failed to update case', updateError)
    }
    if (!updatedCase) {
      throw createApiError(404, 'Case not found')
    }

    return NextResponse.json(updatedCase)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/cases/[id]
 * Delete a case. Access control handled by RLS policies.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, role } = await createApiClient()

    // Only staff and admins can delete cases
    if (role === 'patient') {
      throw createApiError(403, 'Only staff and admins can delete cases')
    }

    // Delete the case (RLS will enforce access rules)
    const { error: deleteError } = await supabase
      .from('cases')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      throw createApiError(500, 'Failed to delete case', deleteError)
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error)
  }
} 