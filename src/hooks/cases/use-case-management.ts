/**
 * Hook for managing case data with pagination and filtering
 */
import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import { useToast } from '@/hooks/use-toast'
import { staffSpecialtyEnum } from '@/lib/validations/case'
import type { 
  CaseResponse, 
  CaseStatus, 
  CaseQueryParams,
  CasePriority,
  CaseCategory,
  CaseDepartment,
  StaffSpecialty
} from '@/lib/validations/case'
import type { CaseFilters, CaseManagementOptions, CaseManagementReturn } from '@/types/cases'
import type { StaffMember } from '@/types/staff'
import { updateCaseStatuses, assignCases } from '@/lib/actions/cases'
import { useCaseSubscription } from '@/lib/features/cases/use-case-subscription'

/**
 * Hook for managing case data, including filtering, selection, and bulk actions
 */
export function useCaseManagement({ 
  limit = 20, 
  isDashboard 
}: CaseManagementOptions = {}): CaseManagementReturn {
  const { user, userRole } = useAuth()
  const [cases, setCases] = useState<CaseResponse[]>([])
  const [filteredCases, setFilteredCases] = useState<CaseResponse[]>([])
  const [selectedCases, setSelectedCases] = useState<string[]>([])
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
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
        assigned_to:users!cases_assigned_to_fkey(id, first_name, last_name),
        patient:users!cases_patient_id_fkey(id, first_name, last_name)
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
      query = query.in('status', currentFilters.status)
    }
    if (currentFilters.priority) {
      query = query.in('priority', currentFilters.priority)
    }
    if (currentFilters.category) {
      query = query.in('category', currentFilters.category)
    }
    if (currentFilters.department) {
      query = query.in('department', currentFilters.department)
    }
    if (currentFilters.specialties) {
      query = query.contains('metadata->specialties', currentFilters.specialties)
    }
    if (currentFilters.search) {
      query = query.or(`title.ilike.%${currentFilters.search}%,description.ilike.%${currentFilters.search}%`)
    }
    if (currentFilters.date_range?.from) {
      query = query.gte('created_at', currentFilters.date_range.from)
    }
    if (currentFilters.date_range?.to) {
      query = query.lte('created_at', currentFilters.date_range.to)
    }

    // Apply pagination
    if (limit) {
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Failed to fetch cases:', error)
      return
    }

    setCases(data || [])
    setFilteredCases(data || [])
    setHasMore(count ? offset + limit < count : false)
    setIsLoading(false)
  }, [user, userRole, limit, offset, currentFilters, supabase])

  // Load more cases (pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore) return
    setOffset(prev => prev + limit)
  }, [hasMore, limit])

  // Handle filter changes
  const handleFilterChange = useCallback((filters: CaseFilters) => {
    const queryParams: Partial<CaseQueryParams> = {
      status: filters.status === 'all' ? undefined : 
        (Array.isArray(filters.status) ? filters.status.filter((s): s is CaseStatus => Boolean(s)) : [filters.status].filter((s): s is CaseStatus => Boolean(s))),
      priority: filters.priority === 'all' ? undefined :
        (Array.isArray(filters.priority) ? filters.priority.filter((p): p is CasePriority => Boolean(p)) : [filters.priority].filter((p): p is CasePriority => Boolean(p))),
      category: filters.category === 'all' ? undefined :
        (Array.isArray(filters.category) ? filters.category.filter((c): c is CaseCategory => Boolean(c)) : [filters.category].filter((c): c is CaseCategory => Boolean(c))),
      department: filters.department === 'all' ? undefined :
        (Array.isArray(filters.department) ? filters.department.filter((d): d is CaseDepartment => Boolean(d)) : [filters.department].filter((d): d is CaseDepartment => Boolean(d))),
      specialties: filters.specialties === 'all' ? undefined :
        (Array.isArray(filters.specialties) ? filters.specialties.filter((s): s is StaffSpecialty => Boolean(s)) : [filters.specialties].filter((s): s is StaffSpecialty => Boolean(s))),
      search: filters.search,
      sort_by: filters.sortBy,
      sort_order: filters.sortOrder,
      date_range: filters.dateRange ? {
        from: filters.dateRange.from?.toISOString(),
        to: filters.dateRange.to?.toISOString()
      } : undefined
    }

    setCurrentFilters(queryParams)
    setOffset(0) // Reset pagination
    loadCases()
  }, [loadCases])

  // Subscribe to real-time updates
  useCaseSubscription({
    onUpdate: (updatedCase) => {
      const shouldInclude = userRole === 'admin' || 
        (userRole === 'patient' && updatedCase.patient_id === user?.id) ||
        (userRole === 'staff' && updatedCase.assigned_to === user?.id)

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
        (userRole === 'staff' && newCase.assigned_to === user?.id)

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
      .select('id, first_name, last_name, role, specialties:metadata->specialties')
      .eq('role', 'staff')
      .order('first_name')

    if (error) {
      console.error('Failed to load staff members:', error)
      return
    }

    setStaffMembers(
      data.map(staff => ({
        id: staff.id,
        name: `${staff.first_name || ''} ${staff.last_name || ''}`.trim(),
        role: 'staff' as const,
        specialties: Array.isArray(staff.specialties) ? 
          staff.specialties.filter((s): s is StaffSpecialty => 
            typeof s === 'string' && Object.values(staffSpecialtyEnum).includes(s as StaffSpecialty)
          ) : undefined
      }))
    )
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
    loadCases()
    loadStaffMembers()
  }, [loadCases, loadStaffMembers])

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
    handleBulkAssignmentChange,
  }
} 