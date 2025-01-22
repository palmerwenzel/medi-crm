import { NextRequest, NextResponse } from 'next/server'
import { webhookTestPayloadSchema } from '@/lib/validations/webhook'
import { deliverWebhook, isRateLimited } from '@/lib/utils/webhook'
import { createApiClient, createApiError, handleApiError } from '@/lib/supabase/api'

// POST /api/webhooks/test?id={id} - Test webhook delivery
export async function POST(request: NextRequest) {
  try {
    const { supabase, user, role } = await createApiClient()

    // Only staff and admin can test webhooks
    if (!['staff', 'admin'].includes(role)) {
      throw createApiError(403, 'Insufficient permissions')
    }

    const { searchParams } = new URL(request.url)
    const webhookId = searchParams.get('id')
    
    if (!webhookId) {
      throw createApiError(400, 'Webhook ID is required')
    }

    // Get webhook details
    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', webhookId)
      .eq('created_by', user.id)
      .single()
    
    if (webhookError || !webhook) {
      throw createApiError(404, 'Webhook not found')
    }

    // Check rate limit
    if (isRateLimited(webhook.url)) {
      throw createApiError(429, 'Rate limit exceeded')
    }

    // Parse and validate test payload
    const json = await request.json()
    const validatedData = webhookTestPayloadSchema.parse(json)
    
    // Prepare test payload
    const testPayload = {
      id: webhookId,
      event: validatedData.event,
      timestamp: new Date().toISOString(),
      data: validatedData.data || {
        message: 'This is a test webhook delivery',
        timestamp: new Date().toISOString(),
      },
    }

    try {
      const response = await deliverWebhook(
        webhook.url,
        testPayload,
        webhook.secret
      )

      // Update last triggered timestamp
      await supabase
        .from('webhooks')
        .update({
          last_triggered_at: new Date().toISOString(),
        })
        .eq('id', webhookId)

      return NextResponse.json({
        success: true,
        statusCode: response.status,
        message: 'Test webhook delivered successfully',
      })
    } catch (error) {
      // Update failure count
      await supabase
        .from('webhooks')
        .update({
          failure_count: webhook.failure_count + 1,
          last_triggered_at: new Date().toISOString(),
        })
        .eq('id', webhookId)

      throw createApiError(500, 'Failed to deliver webhook', error)
    }
  } catch (error) {
    return handleApiError(error)
  }
} 