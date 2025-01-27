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
  CaseHistoryWithActor,
  CaseActivityType
} from '@/types/domain/cases'

interface CaseHistoryQueryParams {
  case_id: string
  activity_type?: CaseActivityType
  from_date?: string
  to_date?: string
  offset?: number
  limit?: number
  sort_order?: 'asc' | 'desc'
}

interface UseCaseHistoryOptions {
  caseId: string
  limit?: number
}

interface UseCaseHistoryReturn {
  history: CaseHistoryWithActor[]
  isLoading: boolean
  hasMore: boolean
  filters: Partial<CaseHistoryQueryParams>
  loadHistory: () => Promise<void>
  loadMore: () => Promise<void>
  setFilters: (filters: Partial<CaseHistoryQueryParams>) => void
}

interface CaseHistoryResponse {
  history: unknown[]
  total: number
  hasMore: boolean
  nextOffset?: number
}

export function useCaseHistory({ 
  caseId, 
  limit = 50 
}: UseCaseHistoryOptions): UseCaseHistoryReturn {
  const [history, setHistory] = useState<CaseHistoryWithActor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [filters, setFilters] = useState<Partial<CaseHistoryQueryParams>>({})
  const supabase = createClient()
  const { toast } = useToast()

  // Type guard for case history response
  const isCaseHistoryResponse = (data: unknown): data is CaseHistoryResponse => {
    return (
      typeof data === 'object' &&
      data !== null &&
      'history' in data &&
      Array.isArray((data as CaseHistoryResponse).history) &&
      'hasMore' in data &&
      typeof (data as CaseHistoryResponse).hasMore === 'boolean'
    )
  }

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

      if (!result.success || !result.data || !isCaseHistoryResponse(result.data)) {
        throw new Error(result.error || 'Failed to load case history')
      }

      const data = result.data as CaseHistoryResponse
      setHistory(data.history as CaseHistoryWithActor[])
      setHasMore(data.hasMore)
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
    if (!hasMore) return

    try {
      const result = await getCaseHistory({
        case_id: caseId,
        limit,
        offset,
        sort_order: 'desc',
        ...filters
      })

      if (!result.success || !result.data || !isCaseHistoryResponse(result.data)) {
        throw new Error(result.error || 'Failed to load more history')
      }

      const data = result.data as CaseHistoryResponse
      setHistory(prev => [...prev, ...(data.history as CaseHistoryWithActor[])])
      setHasMore(data.hasMore)
      setOffset(prev => prev + limit)
    } catch (error) {
      console.error('Error loading more history:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load more history',
        variant: 'destructive',
      })
    }
  }, [caseId, limit, offset, hasMore, filters, toast])

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel(`case_history:${caseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'case_history',
          filter: `case_id=eq.${caseId}`
        },
        async () => {
          // Reload history to ensure we have the latest data with proper ordering
          await loadHistory()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [caseId, supabase, loadHistory])

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
    setFilters
  }
} 