/**
 * Hook for managing case filter preferences with local storage persistence
 */

import { useState, useCallback, useEffect } from 'react'
import type { CaseFilters } from '@/types/domain/cases'

const STORAGE_KEY = 'caseFilters'

const defaultFilters: CaseFilters = {
  status: 'all',
  priority: 'all',
  category: 'all',
  department: 'all',
  search: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
  dateRange: undefined
}

interface UseFilterPreferencesOptions {
  /** Optional callback when filters change */
  onFilterChange?: (filters: CaseFilters) => void
  /** Optional initial filters to override defaults */
  initialFilters?: Partial<CaseFilters>
}

interface UseFilterPreferencesReturn {
  /** Current filter state */
  filters: CaseFilters
  /** Whether filters are currently loading */
  isLoading: boolean
  /** Whether preferences are being saved */
  isSaving: boolean
  /** Update a single filter value */
  updateFilter: <K extends keyof CaseFilters>(key: K, value: CaseFilters[K]) => void
  /** Update multiple filters at once */
  updateFilters: (updates: Partial<CaseFilters>) => void
  /** Save current filters to local storage */
  savePreferences: () => Promise<void>
  /** Reset filters to defaults */
  resetFilters: () => void
}

/**
 * Hook for managing case filter preferences with local storage persistence
 */
export function useFilterPreferences({
  onFilterChange,
  initialFilters = {}
}: UseFilterPreferencesOptions = {}): UseFilterPreferencesReturn {
  const [filters, setFilters] = useState<CaseFilters>({ ...defaultFilters, ...initialFilters })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Load saved preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedFilters = localStorage.getItem(STORAGE_KEY)
        if (savedFilters) {
          const parsed = JSON.parse(savedFilters)
          const newFilters = { ...defaultFilters, ...parsed, ...initialFilters }
          setFilters(newFilters)
          onFilterChange?.(newFilters)
        }
      } catch (error) {
        console.error('Failed to load saved filters:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadPreferences()
  }, [initialFilters, onFilterChange])

  const updateFilter = useCallback(<K extends keyof CaseFilters>(
    key: K,
    value: CaseFilters[K]
  ) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }
      onFilterChange?.(newFilters)
      return newFilters
    })
  }, [onFilterChange])

  const updateFilters = useCallback((updates: Partial<CaseFilters>) => {
    setFilters(prev => {
      const newFilters = { ...prev, ...updates }
      onFilterChange?.(newFilters)
      return newFilters
    })
  }, [onFilterChange])

  const savePreferences = useCallback(async () => {
    setIsSaving(true)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
      // Simulate a delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('Failed to save preferences:', error)
    } finally {
      setIsSaving(false)
    }
  }, [filters])

  const resetFilters = useCallback(() => {
    const newFilters = { ...defaultFilters }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
    localStorage.removeItem(STORAGE_KEY)
  }, [onFilterChange])

  return {
    filters,
    isLoading,
    isSaving,
    updateFilter,
    updateFilters,
    savePreferences,
    resetFilters
  }
} 