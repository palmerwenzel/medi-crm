/**
 * Hook for managing case history
 * Handles loading, filtering, and real-time updates
 */
'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { getCaseHistory } from '@/lib/actions/case-history'
import type { 
  CaseHistoryResponse, 
  CaseHistoryQueryParams,
  CaseActivityType 
} from '@/lib/validations/case-history'

interface UseCaseHistoryOptions {
  caseId: string
  limit?: number
}

interface UseCaseHistoryReturn {
  history: CaseHistoryResponse[]
  isLoading: boolean
  hasMore: boolean
  filters: Partial<CaseHistoryQueryParams>
  loadHistory: () => Promise<void>
  loadMore: () => Promise<void>
  setFilters: (filters: Partial<CaseHistoryQueryParams>) => void
}

export function useCaseHistory({ 
  caseId, 
  limit = 50 
}: UseCaseHistoryOptions): UseCaseHistoryReturn {
  const [history, setHistory] = useState<CaseHistoryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [filters, setFilters] = useState<Partial<CaseHistoryQueryParams>>({})
  const supabase = createClient()
  const { toast } = useToast()

  // Load case history
  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await getCaseHistory({
        case_id: caseId,
        limit,
        offset: 0,
        sort_order: 'desc', // Default to descending order
        ...filters
      })

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to load case history')
      }

      setHistory(result.data.history)
      setHasMore(result.data.hasMore)
      setOffset(limit)
    } catch (error) {
      console.error('Error loading case history:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load case history',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [caseId, limit, filters, toast])

  // Load more history entries
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return

    try {
      const result = await getCaseHistory({
        case_id: caseId,
        limit,
        offset,
        sort_order: 'desc', // Default to descending order
        ...filters
      })

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to load more history')
      }

      setHistory(prev => [...prev, ...result.data.history])
      setHasMore(result.data.hasMore)
      setOffset(prev => prev + limit)
    } catch (error) {
      console.error('Error loading more history:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load more history',
        variant: 'destructive',
      })
    }
  }, [caseId, limit, offset, hasMore, isLoading, filters, toast])

  // Update filters
  const handleFilterChange = useCallback((newFilters: Partial<CaseHistoryQueryParams>) => {
    setFilters(newFilters)
    setOffset(0)
  }, [])

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel(`case_history:${caseId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'case_history',
          filter: `case_id=eq.${caseId}`
        },
        async (payload) => {
          // Fetch the complete history entry with actor details
          const { data: newEntry } = await supabase
            .from('case_history')
            .select(`
              *,
              actor:users!case_history_actor_id_fkey(
                id,
                first_name,
                last_name,
                role
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (newEntry) {
            setHistory(prev => [newEntry, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [caseId, supabase])

  // Initial load
  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  return {
    history,
    isLoading,
    hasMore,
    filters,
    loadHistory,
    loadMore,
    setFilters: handleFilterChange
  }
} 