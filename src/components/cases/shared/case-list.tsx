/**
 * Shared case list component with role-based filtering
 * Used by both dashboard and full case management views
 * Access control handled by RLS policies and useAuth hook
 */
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Clock, FileText } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { FilterBar, type CaseFilters } from './filter-bar'
import { BulkActionBar } from './bulk-action-bar'
import { StaffToolbar } from '../staff/staff-toolbar'
import { InternalNotesEditor } from '../staff/internal-notes-editor'
import { useToast } from '@/hooks/use-toast'
import { updateCaseStatuses, assignCases } from '@/lib/actions/cases'
import { useAuth } from '@/providers/auth-provider'

// Type definitions based on database schema
type CaseStatus = 'open' | 'in_progress' | 'resolved'
type CasePriority = 'low' | 'medium' | 'high' | 'urgent'
type CaseCategory = 'general' | 'followup' | 'prescription' | 'test_results' | 'emergency'

interface Case {
  id: string
  title: string
  description: string
  status: CaseStatus
  priority: CasePriority
  category: CaseCategory
  created_at: string
  attachments: string[]
  assigned_to: { id: string; full_name: string } | null
  patient: { id: string; full_name: string }
}

interface StaffMember {
  id: string
  name: string
}

interface CaseListProps {
  limit?: number
  showActions?: boolean
  isDashboard?: boolean
}

export function CaseList({ 
  limit, 
  showActions = true,
  isDashboard = false 
}: CaseListProps) {
  const { user, userRole } = useAuth()
  const [cases, setCases] = useState<Case[]>([])
  const [filteredCases, setFilteredCases] = useState<Case[]>([])
  const [selectedCases, setSelectedCases] = useState<string[]>([])
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const { toast } = useToast()

  // Track expanded case for notes
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null)

  // Status badge colors
  const statusColors: Record<CaseStatus, string> = {
    open: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
    in_progress: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
    resolved: 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
  }

  // Priority badge colors
  const priorityColors: Record<CasePriority, string> = {
    low: 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20',
    medium: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
    high: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20',
    urgent: 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
  }

  useEffect(() => {
    async function loadCases() {
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
      }

      // Transform the data to combine first_name and last_name into full_name
      const transformedData = data?.map(case_ => ({
        ...case_,
        assigned_to: case_.assigned_to ? {
          id: case_.assigned_to.id,
          full_name: `${case_.assigned_to.first_name || ''} ${case_.assigned_to.last_name || ''}`.trim()
        } : null,
        patient: {
          id: case_.patient.id,
          full_name: `${case_.patient.first_name || ''} ${case_.patient.last_name || ''}`.trim()
        }
      })) || []

      setCases(transformedData)
      setFilteredCases(transformedData)
      setIsLoading(false)
    }

    loadCases()
  }, [userRole, user, limit])

  // Load staff members for assignment
  useEffect(() => {
    async function loadStaffMembers() {
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

    // Only load staff members if user is staff or admin
    if (userRole === 'staff' || userRole === 'admin') {
      loadStaffMembers()
    }
  }, [userRole])

  // Handle filter changes
  const handleFilterChange = (filters: CaseFilters) => {
    let filtered = [...cases]

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(case_ => 
        case_.title.toLowerCase().includes(searchLower) ||
        case_.description.toLowerCase().includes(searchLower)
      )
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(case_ => case_.status === filters.status)
    }

    // Apply priority filter
    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(case_ => case_.priority === filters.priority)
    }

    // Apply date range filter
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
  }

  // Handle bulk selection
  const handleSelectAll = () => {
    setSelectedCases(filteredCases.map(case_ => case_.id))
  }

  const handleDeselectAll = () => {
    setSelectedCases([])
  }

  const handleCaseSelect = (caseId: string) => {
    setSelectedCases(prev => {
      if (prev.includes(caseId)) {
        return prev.filter(id => id !== caseId)
      }
      return [...prev, caseId]
    })
  }

  // Handle bulk actions
  const handleBulkStatusChange = async (status: string) => {
    try {
      const result = await updateCaseStatuses(selectedCases, status as CaseStatus)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: 'Status Updated',
        description: `Successfully updated ${selectedCases.length} cases.`,
      })

      // Clear selection after successful update
      setSelectedCases([])
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update cases',
        variant: 'destructive',
      })
    }
  }

  const handleBulkAssignmentChange = async (userId: string) => {
    try {
      const result = await assignCases(selectedCases, userId)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: 'Cases Assigned',
        description: `Successfully assigned ${selectedCases.length} cases.`,
      })

      // Clear selection after successful assignment
      setSelectedCases([])
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to assign cases',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  const basePath = isDashboard ? '/dashboard/cases' : '/cases'

  return (
    <div className="space-y-4">
      <FilterBar onFilterChange={handleFilterChange} />

      {/* Show staff tools if user is staff/admin and cases are selected */}
      {(userRole === 'staff' || userRole === 'admin') && selectedCases.length > 0 && (
        <StaffToolbar
          selectedCases={selectedCases}
          onUpdate={() => {
            setSelectedCases([])
            loadCases()
          }}
        />
      )}

      {selectedCases.length > 0 && (
        <BulkActionBar
          selectedCases={selectedCases}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onStatusChange={handleBulkStatusChange}
          onAssignmentChange={handleBulkAssignmentChange}
          staffMembers={staffMembers}
        />
      )}

      {filteredCases.map((case_) => (
        <div key={case_.id} className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedCases.includes(case_.id)}
              onCheckedChange={() => handleCaseSelect(case_.id)}
              aria-label={`Select case ${case_.title}`}
            />
            <Link href={`${basePath}/${case_.id}`} className="flex-1">
              <Card className="hover:bg-accent/5 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{case_.title}</h3>
                        <Badge 
                          variant="secondary"
                          className={statusColors[case_.status]}
                        >
                          {case_.status.replace('_', ' ')}
                        </Badge>
                        {case_.priority === 'high' || case_.priority === 'urgent' ? (
                          <Badge 
                            variant="secondary"
                            className={priorityColors[case_.priority]}
                          >
                            {case_.priority}
                          </Badge>
                        ) : null}
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {case_.description?.slice(0, 100)}...
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {case_.assigned_to ? (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            <span>Assigned: {case_.assigned_to.full_name}</span>
                          </div>
                        ) : null}
                        
                        {case_.patient && (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            <span>Patient: {case_.patient.full_name}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(case_.created_at).toLocaleDateString()}</span>
                        </div>

                        {case_.attachments?.length > 0 && (
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span>{case_.attachments.length} attachments</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </div>

          {/* Show internal notes for staff/admin when case is expanded */}
          {(userRole === 'staff' || userRole === 'admin') && expandedCaseId === case_.id && (
            <div className="pl-8">
              <InternalNotesEditor
                caseId={case_.id}
                currentUserId={user.id}
              />
            </div>
          )}

          {/* Toggle notes button for staff/admin */}
          {(userRole === 'staff' || userRole === 'admin') && (
            <div className="pl-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedCaseId(
                  expandedCaseId === case_.id ? null : case_.id
                )}
              >
                {expandedCaseId === case_.id ? 'Hide Notes' : 'Show Notes'}
              </Button>
            </div>
          )}
        </div>
      ))}

      {showActions && cases.length > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" asChild>
            <Link href={basePath}>
              View All Cases
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
} 