import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { useToast } from '@/hooks/use-toast'
import { getCases } from '@/lib/actions/cases'
import type { 
  CaseResponse, 
  CaseStatus,
  CaseQueryParams,
  PaginatedCaseResponse 
} from '@/lib/validations/case'
import type { CaseFilters } from '../filter-bar'
import { updateCaseStatuses, assignCases } from '@/lib/actions/cases'

interface StaffMember {
  id: string
  name: string
}

interface UseCaseManagementOptions {
  limit?: number
  isDashboard?: boolean
}

interface UseCaseManagementReturn {
  cases: CaseResponse[]
  filteredCases: CaseResponse[]
  selectedCases: string[]
  staffMembers: StaffMember[]
  isLoading: boolean
  hasMore: boolean
  loadCases: () => Promise<void>
  loadMore: () => Promise<void>
  handleFilterChange: (filters: CaseFilters) => void
  handleSelectAll: () => void
  handleDeselectAll: () => void
  handleCaseSelect: (caseId: string) => void
  handleBulkStatusChange: (status: CaseStatus) => Promise<void>
  handleBulkAssignmentChange: (userId: string) => Promise<void>
}

/**
 * Hook for managing case data with pagination and filtering
 */
export function useCaseManagement({ limit = 20, isDashboard }: UseCaseManagementOptions): UseCaseManagementReturn {
  const { user, userRole } = useAuth()
  const [cases, setCases] = useState<CaseResponse[]>([])
  const [filteredCases, setFilteredCases] = useState<CaseResponse[]>([])
  const [selectedCases, setSelectedCases] = useState<string[]>([])
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [currentFilters, setCurrentFilters] = useState<Partial<CaseQueryParams>>({})
  const { toast } = useToast()

  const loadCases = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const result = await getCases({
        limit,
        offset: 0,
        ...currentFilters
      })

      // Handle both success and empty results
      if (result.success) {
        const data = result.data as PaginatedCaseResponse
        setCases(data.cases)
        setFilteredCases(data.cases)
        setHasMore(data.hasMore)
        setOffset(limit)
      } else {
        // Only show error toast if it's not just empty
        console.error('Failed to fetch cases:', result.error)
        toast({
          title: 'Error',
          description: result.error || 'Failed to load cases',
          variant: 'destructive',
        })
        // Reset to empty state
        setCases([])
        setFilteredCases([])
        setHasMore(false)
        setOffset(0)
      }
    } catch (error) {
      console.error('Unexpected error loading cases:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
      // Reset to empty state
      setCases([])
      setFilteredCases([])
      setHasMore(false)
      setOffset(0)
    } finally {
      setIsLoading(false)
    }
  }, [user, limit, currentFilters, toast])

  const loadMore = useCallback(async () => {
    if (!user || !hasMore) return

    try {
      const result = await getCases({
        limit,
        offset,
        ...currentFilters
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      const data = result.data as PaginatedCaseResponse
      setCases(prev => [...prev, ...data.cases])
      setFilteredCases(prev => [...prev, ...data.cases])
      setHasMore(data.hasMore)
      setOffset(prev => prev + limit)
    } catch (error) {
      console.error('Failed to fetch more cases:', error)
      toast({
        title: 'Error',
        description: 'Failed to load more cases',
        variant: 'destructive',
      })
    }
  }, [user, hasMore, offset, limit, currentFilters, toast])

  const handleFilterChange = useCallback((filters: CaseFilters) => {
    // Convert UI filters to API query params
    const queryParams: Partial<CaseQueryParams> = {
      status: filters.status === 'all' ? undefined : filters.status,
      priority: filters.priority === 'all' ? undefined : filters.priority,
      search: filters.search,
      sort_by: filters.sortBy,
      sort_order: filters.sortOrder
    }

    setCurrentFilters(queryParams)
    loadCases() // Reload with new filters
  }, [loadCases])

  // Handle bulk selection
  const handleSelectAll = useCallback(() => {
    setSelectedCases(filteredCases.map(case_ => case_.id))
  }, [filteredCases])

  const handleDeselectAll = useCallback(() => {
    setSelectedCases([])
  }, [])

  const handleCaseSelect = useCallback((caseId: string) => {
    setSelectedCases(prev => {
      if (prev.includes(caseId)) {
        return prev.filter(id => id !== caseId)
      }
      return [...prev, caseId]
    })
  }, [])

  // Handle bulk actions
  const handleBulkStatusChange = useCallback(async (status: CaseStatus) => {
    if (selectedCases.length === 0) return

    try {
      const result = await updateCaseStatuses(selectedCases, status)
      if (!result.success) {
        throw new Error(result.error)
      }
      
      // Refresh cases after update
      await loadCases()
      setSelectedCases([])
      
      toast({
        title: 'Success',
        description: 'Cases updated successfully',
      })
    } catch (error) {
      console.error('Failed to update cases:', error)
      toast({
        title: 'Error',
        description: 'Failed to update cases',
        variant: 'destructive',
      })
    }
  }, [selectedCases, loadCases, toast])

  const handleBulkAssignmentChange = useCallback(async (userId: string) => {
    if (selectedCases.length === 0) return

    try {
      const result = await assignCases(selectedCases, userId)
      if (!result.success) {
        throw new Error(result.error)
      }
      
      // Refresh cases after update
      await loadCases()
      setSelectedCases([])
      
      toast({
        title: 'Success',
        description: 'Cases assigned successfully',
      })
    } catch (error) {
      console.error('Failed to assign cases:', error)
      toast({
        title: 'Error',
        description: 'Failed to assign cases',
        variant: 'destructive',
      })
    }
  }, [selectedCases, loadCases, toast])

  // Initial load
  useEffect(() => {
    loadCases()
  }, [loadCases])

  return {
    cases,
    filteredCases,
    selectedCases,
    staffMembers,
    isLoading,
    hasMore,
    loadCases,
    loadMore,
    handleFilterChange,
    handleSelectAll,
    handleDeselectAll,
    handleCaseSelect,
    handleBulkStatusChange,
    handleBulkAssignmentChange
  }
} 