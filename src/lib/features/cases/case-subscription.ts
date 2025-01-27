import { createClient } from '@/utils/supabase/client'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { CaseResponse } from '@/types/domain/cases'

interface CaseSubscriptionCallbacks {
  onUpdate?: (updatedCase: CaseResponse) => void
  onNew?: (newCase: CaseResponse) => void
}

/**
 * Subscribe to real-time case updates
 * @param callbacks - Callback functions for case updates and new cases
 * @returns Cleanup function to unsubscribe
 */
export function subscribeToCases(callbacks: CaseSubscriptionCallbacks): () => void {
  let channel: RealtimeChannel | null = null
  const supabase = createClient()

  try {
    channel = supabase
      .channel('cases_channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cases',
        },
        (payload: RealtimePostgresChangesPayload<CaseResponse>) => {
          if (callbacks.onUpdate && payload.new && 'id' in payload.new) {
            callbacks.onUpdate(payload.new as CaseResponse)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cases',
        },
        (payload: RealtimePostgresChangesPayload<CaseResponse>) => {
          if (callbacks.onNew && payload.new && 'id' in payload.new) {
            callbacks.onNew(payload.new as CaseResponse)
          }
        }
      )
      .subscribe()

    // Return cleanup function
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  } catch (error) {
    console.error('Error setting up case subscription:', error)
    return () => {} // Return no-op cleanup if setup failed
  }
} 