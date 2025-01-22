import { createClient } from '@/lib/supabase/server'
import { WebhookEventType, WebhookPayload } from '@/lib/validations/webhook'
import { deliverWebhook, isRateLimited } from '@/lib/utils/webhook'

/**
 * Triggers webhooks for a specific event
 */
export async function triggerWebhooks(
  event: WebhookEventType,
  data: Record<string, unknown>
): Promise<void> {
  const supabase = await createClient()

  // Get all active webhooks subscribed to this event
  const { data: webhooks, error } = await supabase
    .from('webhooks')
    .select('*')
    .contains('events', [event])
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching webhooks:', error)
    return
  }

  // Prepare webhook payload
  const payload: WebhookPayload = {
    id: crypto.randomUUID(),
    event,
    timestamp: new Date().toISOString(),
    data,
  }

  // Deliver to each webhook in parallel
  const deliveryPromises = webhooks.map(async (webhook) => {
    // Skip if rate limited
    if (isRateLimited(webhook.url)) {
      console.warn(`Webhook ${webhook.id} is rate limited, skipping delivery`)
      return
    }

    try {
      await deliverWebhook(webhook.url, payload, webhook.secret)

      // Update last triggered timestamp
      await supabase
        .from('webhooks')
        .update({
          last_triggered_at: new Date().toISOString(),
        })
        .eq('id', webhook.id)
    } catch (error) {
      console.error(`Error delivering webhook ${webhook.id}:`, error)

      // Update failure count
      await supabase
        .from('webhooks')
        .update({
          failure_count: webhook.failure_count + 1,
          last_triggered_at: new Date().toISOString(),
        })
        .eq('id', webhook.id)

      // Deactivate webhook if too many failures
      if (webhook.failure_count >= 10) {
        await supabase
          .from('webhooks')
          .update({
            is_active: false,
          })
          .eq('id', webhook.id)
      }
    }
  })

  // Wait for all deliveries to complete
  await Promise.allSettled(deliveryPromises)
}

/**
 * Triggers webhooks for case creation
 */
export async function triggerCaseCreated(
  caseId: string,
  caseData: Record<string, unknown>
): Promise<void> {
  await triggerWebhooks(WebhookEventType.CASE_CREATED, {
    case_id: caseId,
    ...caseData,
  })
}

/**
 * Triggers webhooks for case updates
 */
export async function triggerCaseUpdated(
  caseId: string,
  caseData: Record<string, unknown>,
  changes: Record<string, unknown>
): Promise<void> {
  await triggerWebhooks(WebhookEventType.CASE_UPDATED, {
    case_id: caseId,
    case_data: caseData,
    changes,
  })
}

/**
 * Triggers webhooks for case status changes
 */
export async function triggerCaseStatusChanged(
  caseId: string,
  oldStatus: string,
  newStatus: string,
  caseData: Record<string, unknown>
): Promise<void> {
  await triggerWebhooks(WebhookEventType.CASE_STATUS_CHANGED, {
    case_id: caseId,
    old_status: oldStatus,
    new_status: newStatus,
    case_data: caseData,
  })
}

/**
 * Triggers webhooks for case assignment changes
 */
export async function triggerCaseAssigned(
  caseId: string,
  oldAssignee: string | null,
  newAssignee: string,
  caseData: Record<string, unknown>
): Promise<void> {
  await triggerWebhooks(WebhookEventType.CASE_ASSIGNED, {
    case_id: caseId,
    old_assignee: oldAssignee,
    new_assignee: newAssignee,
    case_data: caseData,
  })
}

/**
 * Triggers webhooks for case deletion
 */
export async function triggerCaseDeleted(
  caseId: string,
  caseData: Record<string, unknown>
): Promise<void> {
  await triggerWebhooks(WebhookEventType.CASE_DELETED, {
    case_id: caseId,
    case_data: caseData,
  })
} 