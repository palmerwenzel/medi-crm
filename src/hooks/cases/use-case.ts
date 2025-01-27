import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { CaseResponse } from '@/types/domain/cases'

interface UseCaseReturn {
  case_: CaseResponse | null
  isLoading: boolean
  error: Error | null
  mutate: () => Promise<void>
}

export function useCase(caseId: string): UseCaseReturn {
  const [case_, setCase] = useState<CaseResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchCase = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('cases')
        .select(`
          *,
          assigned_to:users!cases_assigned_to_fkey(id, first_name, last_name, role, specialty),
          patient:users!cases_patient_id_fkey(id, first_name, last_name)
        `)
        .eq('id', caseId)
        .single()

      if (fetchError) throw fetchError

      setCase(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch case'))
    } finally {
      setIsLoading(false)
    }
  }, [caseId, supabase])

  useEffect(() => {
    fetchCase()

    // Subscribe to case changes
    const channel = supabase
      .channel(`case_${caseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cases',
          filter: `id=eq.${caseId}`
        },
        () => {
          fetchCase()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [caseId, fetchCase, supabase])

  return {
    case_,
    isLoading,
    error,
    mutate: fetchCase
  }
} 