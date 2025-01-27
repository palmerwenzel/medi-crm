/**
 * Hook for managing case data with pagination and filtering
 */
import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import { useToast } from '@/hooks/use-toast'
import type { 
  CaseResponse, 
  CaseStatus,
  CaseQueryParams,
  CaseFilters,
  CaseManagementOptions,
  CaseManagementReturn,
} from '@/types/domain/cases'
import type { StaffMember } from '@/types/domain/users'
import { updateCaseStatuses, assignCases } from '@/lib/actions/cases'
import { useCaseSubscription } from '@/lib/features/cases/use-case-subscription'

/**
 * Hook for managing case data, including filtering, selection, and bulk actions
 */
export function useCaseManagement({ 
  limit = 20,
}: CaseManagementOptions = {}): CaseManagementReturn {
  const { user, userRole } = useAuth()
  const [cases, setCases] = useState<CaseResponse[]>([])
  const [filteredCases, setFilteredCases] = useState<CaseResponse[]>([])
  const [selectedCases, setSelectedCases] = useState<string[]>([])
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<Partial<CaseQueryParams>>({})
  const supabase = createClient()
  const { toast } = useToast()

  // Load cases with pagination and role-based filtering
  const loadCases = useCallback(async () => {
    if (!user) return

    let query = supabase
      .from('cases')
      .select(`
        *,
        assigned_to:users!cases_assigned_to_fkey(
          id,
          first_name,
          last_name,
          role,
          specialty
        ),
        patient:users!cases_patient_id_fkey(
          id,
          first_name,
          last_name
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply role-based filtering
    switch (userRole) {
      case 'patient':
        query = query.eq('patient_id', user.id)
        break
      case 'staff':
        query = query.eq('assigned_to', user.id)
        break
      // Admin sees all cases
    }

    // Apply current filters
    if (currentFilters.status) {
      query = query.eq('status', currentFilters.status)
    }
    if (currentFilters.priority) {
      query = query.eq('priority', currentFilters.priority)
    }
    if (currentFilters.category) {
      query = query.eq('category', currentFilters.category)
    }
    if (currentFilters.department) {
      query = query.eq('department', currentFilters.department)
    }
    if (currentFilters.search) {
      query = query.or(`title.ilike.%${currentFilters.search}%,description.ilike.%${currentFilters.search}%`)
    }

    // Apply pagination
    if (limit) {
      query = query.range(0, limit - 1)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Failed to fetch cases:', error)
      return
    }

    setCases(data as CaseResponse[])
    setFilteredCases(data as CaseResponse[])
    setHasMore(!!count && count > (data?.length || 0))
    setIsLoading(false)
  }, [user, userRole, limit, currentFilters, supabase])

  // Load more cases
  const loadMore = useCallback(async () => {
    // Implementation of loadMore...
    // This is a placeholder as the actual implementation would depend on your pagination strategy
    return Promise.resolve()
  }, [])

  // Handle filter changes
  const handleFilterChange = useCallback((filters: CaseFilters) => {
    // Convert UI filters to API query params
    const queryParams: Partial<CaseQueryParams> = {
      status: filters.status === 'all' ? undefined : 
        Array.isArray(filters.status) ? filters.status[0] : filters.status,
      priority: filters.priority === 'all' ? undefined :
        Array.isArray(filters.priority) ? filters.priority[0] : filters.priority,
      category: filters.category === 'all' ? undefined :
        Array.isArray(filters.category) ? filters.category[0] : filters.category,
      department: filters.department === 'all' ? undefined :
        Array.isArray(filters.department) ? filters.department[0] : filters.department,
      search: filters.search,
      sort_by: filters.sortBy,
      sort_order: filters.sortOrder,
    }

    setCurrentFilters(queryParams)
    loadCases() // Reload with new filters
  }, [loadCases])

  // Subscribe to real-time updates
  useCaseSubscription({
    onUpdate: (updatedCase) => {
      const shouldInclude = userRole === 'admin' || 
        (userRole === 'patient' && updatedCase.patient_id === user?.id) ||
        (userRole === 'staff' && updatedCase.assigned_to?.id === user?.id)

      if (shouldInclude) {
        setCases(prev => {
          const updated = prev.map(c => c.id === updatedCase.id ? updatedCase : c)
          return updated
        })
        setFilteredCases(prev => {
          const updated = prev.map(c => c.id === updatedCase.id ? updatedCase : c)
          return updated
        })
      }
    },
    onNew: (newCase) => {
      const shouldInclude = userRole === 'admin' || 
        (userRole === 'patient' && newCase.patient_id === user?.id) ||
        (userRole === 'staff' && newCase.assigned_to?.id === user?.id)

      if (shouldInclude) {
        setCases(prev => {
          const updated = [newCase, ...prev]
          if (limit && updated.length > limit) {
            updated.pop()
          }
          return updated
        })
        setFilteredCases(prev => {
          const updated = [newCase, ...prev]
          if (limit && updated.length > limit) {
            updated.pop()
          }
          return updated
        })
      }
    }
  })

  // Load staff members for assignment
  const loadStaffMembers = useCallback(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, role, specialty, department, email')
      .eq('role', 'staff')
      .order('first_name')

    if (error) {
      console.error('Failed to load staff members:', error)
      return
    }

    setStaffMembers(data as StaffMember[])
  }, [supabase])

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
    try {
      const result = await updateCaseStatuses(selectedCases, status)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: 'Status Updated',
        description: `Successfully updated ${selectedCases.length} cases.`,
      })

      setSelectedCases([])
      await loadCases()
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update case statuses.',
        variant: 'destructive',
      })
    }
  }, [selectedCases, loadCases, toast])

  const handleBulkAssignmentChange = useCallback(async (userId: string) => {
    try {
      const result = await assignCases(selectedCases, userId)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: 'Cases Assigned',
        description: `Successfully assigned ${selectedCases.length} cases.`,
      })

      setSelectedCases([])
      await loadCases()
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to assign cases.',
        variant: 'destructive',
      })
    }
  }, [selectedCases, loadCases, toast])

  // Initial load
  useEffect(() => {
    if (user) {
      loadCases()
      loadStaffMembers()
    }
  }, [user, loadCases, loadStaffMembers])

  return {
    cases,
    filteredCases,
    selectedCases,
    isLoading,
    hasMore,
    loadCases,
    loadMore,
    handleFilterChange,
    handleSelectAll,
    handleDeselectAll,
    handleCaseSelect,
    handleBulkStatusChange,
    handleBulkAssignmentChange,
  }
} 