import { useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import { useToast } from '@/hooks/use-toast'
import type { CaseResponse, CaseStatus } from '@/lib/validations/case'
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
  loadCases: () => Promise<void>
  handleFilterChange: (filters: CaseFilters) => void
  handleSelectAll: () => void
  handleDeselectAll: () => void
  handleCaseSelect: (caseId: string) => void
  handleBulkStatusChange: (status: string) => Promise<void>
  handleBulkAssignmentChange: (userId: string) => Promise<void>
}

export function useCaseManagement({ limit, isDashboard }: UseCaseManagementOptions): UseCaseManagementReturn {
  const { user, userRole } = useAuth()
  const [cases, setCases] = useState<CaseResponse[]>([])
  const [filteredCases, setFilteredCases] = useState<CaseResponse[]>([])
  const [selectedCases, setSelectedCases] = useState<string[]>([])
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const { toast } = useToast()

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
    setFilteredCases(data || [])
    setIsLoading(false)
  }, [user, userRole, limit, supabase])

  // Load staff members for assignment
  const loadStaffMembers = useCallback(async () => {
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
  }, [supabase])

  // Handle filter changes
  const handleFilterChange = useCallback((filters: CaseFilters) => {
    let filtered = [...cases]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(case_ => 
        case_.title.toLowerCase().includes(searchLower) ||
        case_.description.toLowerCase().includes(searchLower)
      )
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(case_ => case_.status === filters.status)
    }

    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(case_ => case_.priority === filters.priority)
    }

    if (filters.dateRange?.from) {
      filtered = filtered.filter(case_ => {
        const caseDate = new Date(case_.created_at)
        const fromDate = new Date(filters.dateRange!.from!)
        return caseDate >= fromDate
      })
    }
    if (filters.dateRange?.to) {
      filtered = filtered.filter(case_ => {
        const caseDate = new Date(case_.created_at)
        const toDate = new Date(filters.dateRange!.to!)
        return caseDate <= toDate
      })
    }

    setFilteredCases(filtered)
  }, [cases])

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
  const handleBulkStatusChange = useCallback(async (status: string) => {
    try {
      const result = await updateCaseStatuses(selectedCases, status as CaseStatus)
      
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
        description: err instanceof Error ? err.message : 'Failed to update cases',
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
        description: err instanceof Error ? err.message : 'Failed to assign cases',
        variant: 'destructive',
      })
    }
  }, [selectedCases, loadCases, toast])

  return {
    cases,
    filteredCases,
    selectedCases,
    staffMembers,
    isLoading,
    loadCases,
    handleFilterChange,
    handleSelectAll,
    handleDeselectAll,
    handleCaseSelect,
    handleBulkStatusChange,
    handleBulkAssignmentChange
  }
} 