import { NextRequest, NextResponse } from 'next/server'
import { webhookPayloadSchema } from '@/lib/validations/webhooks'
import { createApiClient, createApiError, handleApiError } from '@/utils/supabase/api'
import { randomBytes } from 'crypto'

// Helper to generate a secure webhook secret
function generateWebhookSecret(): string {
  return randomBytes(32).toString('hex')
}

/**
 * GET /api/webhooks - List webhooks
 * Access control handled by RLS policies
 */
export async function GET() {
  try {
    const { supabase, role } = await createApiClient()

    // Only staff and admin can access webhooks
    if (!['staff', 'admin'].includes(role)) {
      throw createApiError(403, 'Insufficient permissions')
    }

    const { data: webhooks, error } = await supabase
      .from('webhooks')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      throw createApiError(500, 'Failed to fetch webhooks', error)
    }
    
    return NextResponse.json(webhooks)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/webhooks - Register new webhook
 * Access control handled by RLS policies
 */
export async function POST(request: NextRequest) {
  try {
    const { supabase, user, role } = await createApiClient()

    // Only staff and admin can create webhooks
    if (!['staff', 'admin'].includes(role)) {
      throw createApiError(403, 'Insufficient permissions')
    }

    const json = await request.json()
    const validatedData = webhookPayloadSchema.parse(json)
    
    // Generate a secure secret for the webhook
    const secret = generateWebhookSecret()
    
    const { data: webhook, error } = await supabase
      .from('webhooks')
      .insert({
        ...validatedData,
        secret,
        created_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      throw createApiError(500, 'Failed to create webhook', error)
    }
    
    return NextResponse.json(webhook)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/webhooks?id={id} - Delete webhook
 * Access control handled by RLS policies
 */
export async function DELETE(request: NextRequest) {
  try {
    const { supabase, user, role } = await createApiClient()

    // Only staff and admin can delete webhooks
    if (!['staff', 'admin'].includes(role)) {
      throw createApiError(403, 'Insufficient permissions')
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      throw createApiError(400, 'Webhook ID is required')
    }

    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id)
      .eq('created_by', user.id)
    
    if (error) {
      throw createApiError(500, 'Failed to delete webhook', error)
    }
    
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error)
  }
} 