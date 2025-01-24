/**
 * Hook for managing case data with pagination and filtering
 */
import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import { useToast } from '@/hooks/use-toast'
import type { CaseResponse, CaseStatus, CaseQueryParams } from '@/lib/validations/case'
import type { CaseFilters } from '@/types/filters'
import { updateCaseStatuses, assignCases } from '@/lib/actions/cases'
import { useCaseSubscription } from '@/lib/features/cases/use-case-subscription'

interface StaffMemberBasic {
  id: string
  name: string
}

interface UseCaseManagementOptions {
  limit?: number
}

interface UseCaseManagementReturn {
  cases: CaseResponse[]
  filteredCases: CaseResponse[]
  selectedCases: string[]
  staffMembers: StaffMemberBasic[]
  isLoading: boolean
  loadCases: () => Promise<void>
  loadMore: () => Promise<void>
  handleFilterChange: (filters: CaseFilters) => void
  handleSelectAll: () => void
  handleDeselectAll: () => void
  handleCaseSelect: (id: string) => void
  handleBulkStatusChange: (status: CaseStatus) => Promise<void>
  handleBulkAssignmentChange: (userId: string) => Promise<void>
}

export function useCaseManagement({ limit = 20 }: UseCaseManagementOptions): UseCaseManagementReturn {
  const { user, userRole } = useAuth()
  const [cases, setCases] = useState<CaseResponse[]>([])
  const [filteredCases, setFilteredCases] = useState<CaseResponse[]>([])
  const [selectedCases, setSelectedCases] = useState<string[]>([])
  const [staffMembers, setStaffMembers] = useState<StaffMemberBasic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentFilters, setCurrentFilters] = useState<Partial<CaseQueryParams>>({})
  const supabase = createClient()
  const { toast } = useToast()

  // Load staff members when needed (for staff/admin users)
  useEffect(() => {
    async function loadStaffMembers() {
      if (userRole !== 'staff' && userRole !== 'admin') return
      if (staffMembers.length > 0) return // Don't reload if we already have staff members

      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .eq('role', 'staff')
        .order('first_name')

      if (error) {
        console.error('Failed to load staff members:', error)
        return
      }

      setStaffMembers(
        data.map(staff => ({
          id: staff.id,
          name: `${staff.first_name || ''} ${staff.last_name || ''}`.trim()
        }))
      )
    }

    loadStaffMembers()
  }, [supabase, userRole, staffMembers.length])

  // Apply filters to cases
  const applyFilters = useCallback((casesToFilter: CaseResponse[], filters: Partial<CaseQueryParams>) => {
    let filtered = [...casesToFilter]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(case_ => 
        case_.title.toLowerCase().includes(searchLower) ||
        case_.description.toLowerCase().includes(searchLower)
      )
    }

    if (filters.status?.length) {
      filtered = filtered.filter(case_ => filters.status!.includes(case_.status))
    }

    if (filters.priority?.length) {
      filtered = filtered.filter(case_ => filters.priority!.includes(case_.priority))
    }

    if (filters.category?.length) {
      filtered = filtered.filter(case_ => filters.category!.includes(case_.category))
    }

    if (filters.department?.length) {
      filtered = filtered.filter(case_ => filters.department!.includes(case_.department))
    }

    if (filters.date_range?.from) {
      filtered = filtered.filter(case_ => {
        const caseDate = new Date(case_.created_at)
        const fromDate = new Date(filters.date_range!.from!)
        return caseDate >= fromDate
      })
    }
    if (filters.date_range?.to) {
      filtered = filtered.filter(case_ => {
        const caseDate = new Date(case_.created_at)
        const toDate = new Date(filters.date_range!.to!)
        return caseDate <= toDate
      })
    }

    setFilteredCases(filtered)
  }, [])

  const loadCases = useCallback(async () => {
    if (!user) return

    let query = supabase
      .from('cases')
      .select(`
        *,
        assigned_to:users!cases_assigned_to_fkey(id, first_name, last_name),
        patient:users!cases_patient_id_fkey(id, first_name, last_name)
      `)
      .order('created_at', { ascending: false })

    // Role-based filtering
    switch (userRole) {
      case 'patient':
        query = query.eq('patient_id', user.id)
        break
      case 'staff':
        query = query.eq('assigned_to', user.id)
        break
      // Admin sees all cases
    }

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query
    
    if (error) {
      console.error('Failed to fetch cases:', error)
      return
    }

    setCases(data || [])
    // Re-apply current filters to the new data
    applyFilters(data || [], currentFilters)
    setIsLoading(false)
  }, [user, userRole, limit, supabase, applyFilters, currentFilters])

  // Handle filter changes
  const handleFilterChange = useCallback((filters: CaseFilters) => {
    // Convert UI filters to API query params
    const queryParams: Partial<CaseQueryParams> = {
      status: filters.status === 'all' || !filters.status ? undefined : 
        Array.isArray(filters.status) ? filters.status : [filters.status],
      priority: filters.priority === 'all' || !filters.priority ? undefined :
        Array.isArray(filters.priority) ? filters.priority : [filters.priority],
      category: filters.category === 'all' || !filters.category ? undefined :
        Array.isArray(filters.category) ? filters.category : [filters.category],
      department: filters.department === 'all' || !filters.department ? undefined :
        Array.isArray(filters.department) ? filters.department : [filters.department],
      specialty: filters.specialty === 'all' || !filters.specialty ? undefined : filters.specialty,
      search: filters.search,
      sort_by: filters.sortBy,
      sort_order: filters.sortOrder,
      date_range: filters.dateRange ? {
        from: filters.dateRange.from?.toISOString(),
        to: filters.dateRange.to?.toISOString()
      } : undefined
    }

    setCurrentFilters(queryParams)
    loadCases() // Reload with new filters
  }, [loadCases])

  // Subscribe to real-time updates
  useCaseSubscription({
    onUpdate: (updatedCase) => {
      // Only update if the case belongs to the current user (based on role)
      const shouldInclude = userRole === 'admin' || 
        (userRole === 'patient' && updatedCase.patient_id === user?.id) ||
        (userRole === 'staff' && updatedCase.assigned_to?.id === user?.id)

      if (shouldInclude) {
        setCases(prev => {
          const updated = prev.map(c => c.id === updatedCase.id ? updatedCase : c)
          applyFilters(updated, currentFilters)
          return updated
        })
      }
    },
    onNew: (newCase) => {
      // Only add if the case belongs to the current user (based on role)
      const shouldInclude = userRole === 'admin' || 
        (userRole === 'patient' && newCase.patient_id === user?.id) ||
        (userRole === 'staff' && newCase.assigned_to?.id === user?.id)

      if (shouldInclude) {
        setCases(prev => {
          const updated = [newCase, ...prev]
          if (limit && updated.length > limit) {
            updated.pop() // Remove last item if we're over the limit
          }
          applyFilters(updated, currentFilters)
          return updated
        })
      }
    }
  })

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
        throw new Error(result.error || 'Failed to update cases')
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
        description: err instanceof Error ? err.message : 'Failed to update cases',
        variant: 'destructive',
      })
    }
  }, [selectedCases, loadCases, toast])

  const handleBulkAssignmentChange = useCallback(async (userId: string) => {
    try {
      const result = await assignCases(selectedCases, userId)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to assign cases')
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
        description: err instanceof Error ? err.message : 'Failed to assign cases',
        variant: 'destructive',
      })
    }
  }, [selectedCases, loadCases, toast])

  // Add loadMore function
  const loadMore = useCallback(async () => {
    // Implementation would go here if needed
    // Currently not implemented as we're not using infinite scroll
  }, [])

  return {
    cases,
    filteredCases,
    selectedCases,
    staffMembers,
    isLoading,
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