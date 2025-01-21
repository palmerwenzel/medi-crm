import { supabase } from './client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { CaseResponse } from '@/lib/validations/case'

/**
 * Subscribe to real-time case updates
 * @param onUpdate - Callback when a case is updated
 * @param onNew - Callback when a new case is created
 * @returns Cleanup function to unsubscribe
 */
export function subscribeToCases(
  onUpdate?: (payload: CaseResponse) => void,
  onNew?: (payload: CaseResponse) => void,
): () => void {
  let channel: RealtimeChannel | null = null

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
        (payload) => {
          if (onUpdate && payload.new) {
            onUpdate(payload.new as CaseResponse)
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
        (payload) => {
          if (onNew && payload.new) {
            onNew(payload.new as CaseResponse)
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
    console.error('Error setting up real-time subscription:', error)
    return () => {} // Return no-op cleanup if setup failed
  }
} 