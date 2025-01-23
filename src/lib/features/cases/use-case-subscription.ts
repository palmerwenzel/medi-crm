import { useEffect } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { subscribeToCases } from './case-subscription'
import type { CaseResponse } from '@/lib/validations/case'

interface UseCaseSubscriptionOptions {
  onUpdate?: (updatedCase: CaseResponse) => void
  onNew?: (newCase: CaseResponse) => void
}

/**
 * Hook to subscribe to real-time case updates with role-based filtering
 * @param options.onUpdate - Callback when a case is updated
 * @param options.onNew - Callback when a new case is created
 */
export function useCaseSubscription({ onUpdate, onNew }: UseCaseSubscriptionOptions) {
  const { user, userRole } = useAuth()

  useEffect(() => {
    if (!user) return

    // Create role-based filter function
    const shouldIncludeCase = (caseData: CaseResponse) => {
      return userRole === 'admin' || 
        (userRole === 'patient' && caseData.patient_id === user.id) ||
        (userRole === 'staff' && caseData.assigned_to === user.id)
    }

    // Set up subscription with role-based filtering
    const cleanup = subscribeToCases({
      onUpdate: (updatedCase) => {
        if (onUpdate && shouldIncludeCase(updatedCase)) {
          onUpdate(updatedCase)
        }
      },
      onNew: (newCase) => {
        if (onNew && shouldIncludeCase(newCase)) {
          onNew(newCase)
        }
      }
    })

    return cleanup
  }, [user, userRole, onUpdate, onNew])
} 