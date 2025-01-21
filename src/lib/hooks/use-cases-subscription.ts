import { useEffect } from 'react'
import { subscribeToCases } from '@/lib/supabase/realtime'
import type { CaseResponse } from '@/lib/validations/case'

type UseCasesSubscriptionProps = {
  onUpdate?: (updatedCase: CaseResponse) => void
  onNew?: (newCase: CaseResponse) => void
}

/**
 * React hook to subscribe to real-time case updates
 * @param props - Callbacks for case updates and new cases
 */
export function useCasesSubscription({ onUpdate, onNew }: UseCasesSubscriptionProps) {
  useEffect(() => {
    // Set up subscription
    const cleanup = subscribeToCases(onUpdate, onNew)

    // Cleanup on unmount
    return () => {
      cleanup()
    }
  }, [onUpdate, onNew])
} 