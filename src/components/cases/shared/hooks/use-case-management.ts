/**
 * Hook for managing case data with pagination and filtering
 */
import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import { useToast } from '@/hooks/use-toast'
import type { CaseResponse, CaseStatus, CaseQueryParams, CaseFilters } from '@/types/domain/cases'
import { updateCaseStatuses, assignCases } from '@/lib/actions/cases'
import { useCaseSubscription } from '@/lib/features/cases/use-case-subscription'

interface StaffMemberBasic {
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
  staffMembers: StaffMemberBasic[]
  isLoading: boolean
  hasMore: boolean
  loadCases: () => Promise<void>
  loadMore: () => Promise<void>
  handleFilterChange: (filters: CaseFilters) => void
  handleSelectAll: () => void
  handleDeselectAll: () => void
  handleCaseSelect: (id: string) => void
  handleBulkStatusChange: (status: CaseStatus) => Promise<void>
  handleBulkAssignmentChange: (userId: string) => Promise<void>
}

export function useCaseManagement({ limit = 20, isDashboard = false }: UseCaseManagementOptions = {}): UseCaseManagementReturn {
  const [cases, setCases] = useState<CaseResponse[]>([])
  const [selectedCases, setSelectedCases] = useState<string[]>([])
  const [staffMembers, setStaffMembers] = useState<StaffMemberBasic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<CaseFilters>({})
  const [currentOffset, setCurrentOffset] = useState(0)
  
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  // Subscribe to case updates
  useCaseSubscription({
    onUpdate: (updatedCase) => {
      setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c))
    }
  })

  // Apply filters to get filtered cases
  const filteredCases = cases.filter(case_ => {
    if (currentFilters.status && currentFilters.status !== 'all' && case_.status !== currentFilters.status) {
      return false
    }
    if (currentFilters.priority && currentFilters.priority !== 'all' && case_.priority !== currentFilters.priority) {
      return false
    }
    if (currentFilters.category && currentFilters.category !== 'all' && case_.category !== currentFilters.category) {
      return false
    }
    if (currentFilters.department && currentFilters.department !== 'all' && case_.department !== currentFilters.department) {
      return false
    }
    if (currentFilters.search) {
      const searchLower = currentFilters.search.toLowerCase()
      return case_.title.toLowerCase().includes(searchLower) || 
             case_.description.toLowerCase().includes(searchLower)
    }
    return true
  })

  const loadCases = useCallback(async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const queryParams: Partial<CaseQueryParams> = {
        limit,
        offset: currentOffset,
        sort_by: currentFilters.sortBy,
        sort_order: currentFilters.sortOrder,
        status: currentFilters.status === 'all' ? undefined : 
          Array.isArray(currentFilters.status) ? currentFilters.status[0] : currentFilters.status,
        priority: currentFilters.priority === 'all' ? undefined :
          Array.isArray(currentFilters.priority) ? currentFilters.priority[0] : currentFilters.priority,
        category: currentFilters.category === 'all' ? undefined :
          Array.isArray(currentFilters.category) ? currentFilters.category[0] : currentFilters.category,
        department: currentFilters.department === 'all' ? undefined :
          Array.isArray(currentFilters.department) ? currentFilters.department[0] : currentFilters.department,
        search: currentFilters.search
      }

      // Filter out undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof CaseQueryParams] === undefined) {
          delete queryParams[key as keyof CaseQueryParams]
        }
      })

      const response = await supabase
        .from('cases')
        .select(`
          *,
          patient:users!cases_patient_id_fkey(id, first_name, last_name),
          assigned_to:users!cases_assigned_to_fkey(id, first_name, last_name, role, specialty)
        `)
        .range(currentOffset, currentOffset + limit - 1)
        .order(queryParams.sort_by || 'created_at', {
          ascending: queryParams.sort_order === 'asc'
        })

      if (response.error) throw response.error

      const newCases = response.data as CaseResponse[]
      setCases(prev => currentOffset === 0 ? newCases : [...prev, ...newCases])
      setHasMore(newCases.length === limit)
    } catch (error) {
      console.error('Error loading cases:', error)
      toast({
        title: 'Error',
        description: 'Failed to load cases',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, limit, currentOffset, currentFilters, supabase, toast])

  const loadMore = useCallback(async () => {
    setCurrentOffset(prev => prev + limit)
  }, [limit])

  const handleFilterChange = useCallback((filters: CaseFilters) => {
    setCurrentFilters(filters)
    setCurrentOffset(0)
    setCases([])
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedCases(filteredCases.map(c => c.id))
  }, [filteredCases])

  const handleDeselectAll = useCallback(() => {
    setSelectedCases([])
  }, [])

  const handleCaseSelect = useCallback((id: string) => {
    setSelectedCases(prev => {
      if (prev.includes(id)) {
        return prev.filter(caseId => caseId !== id)
      }
      return [...prev, id]
    })
  }, [])

  const handleBulkStatusChange = useCallback(async (status: CaseStatus) => {
    try {
      await updateCaseStatuses(selectedCases, status)
      toast({
        title: 'Success',
        description: 'Cases updated successfully'
      })
      handleDeselectAll()
      await loadCases()
    } catch (error) {
      console.error('Error updating cases:', error)
      toast({
        title: 'Error',
        description: 'Failed to update cases',
        variant: 'destructive'
      })
    }
  }, [selectedCases, toast, handleDeselectAll, loadCases])

  const handleBulkAssignmentChange = useCallback(async (userId: string) => {
    try {
      await assignCases(selectedCases, userId)
      toast({
        title: 'Success',
        description: 'Cases assigned successfully'
      })
      handleDeselectAll()
      await loadCases()
    } catch (error) {
      console.error('Error assigning cases:', error)
      toast({
        title: 'Error',
        description: 'Failed to assign cases',
        variant: 'destructive'
      })
    }
  }, [selectedCases, toast, handleDeselectAll, loadCases])

  // Load initial data
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