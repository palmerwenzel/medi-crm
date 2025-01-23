/**
 * Case Management View Component
 * Advanced list view with filtering, bulk actions, and role-based controls
 * Used for detailed case management in both dashboard and full views
 * Access control handled by RLS policies and useAuth hook
 */
'use client'

import { useState } from 'react'
import { FilterBar } from './filter-bar'
import { BulkActionBar } from './bulk-action-bar'
import { StaffToolbar } from '../staff/staff-toolbar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import { CaseListItem } from './case-list-item'
import { useCaseManagement } from './hooks/use-case-management'

interface CaseManagementViewProps {
  limit?: number
  showActions?: boolean
  isDashboard?: boolean
}

export function CaseManagementView({ 
  limit, 
  showActions = true,
  isDashboard = false 
}: CaseManagementViewProps) {
  const { userRole } = useAuth()
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null)
  
  const {
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
  } = useCaseManagement({ limit, isDashboard })

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
  const isStaffOrAdmin = userRole === 'staff' || userRole === 'admin'

  return (
    <div className="space-y-4">
      <FilterBar onFilterChange={handleFilterChange} />

      {/* Show staff tools if user is staff/admin and cases are selected */}
      {isStaffOrAdmin && selectedCases.length > 0 && (
        <StaffToolbar
          selectedCases={selectedCases}
          onUpdate={async () => {
            handleDeselectAll()
            await loadCases()
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
        <CaseListItem
          key={case_.id}
          case_={case_}
          isSelected={selectedCases.includes(case_.id)}
          onSelect={handleCaseSelect}
          showNotes={expandedCaseId === case_.id}
          onToggleNotes={() => setExpandedCaseId(
            expandedCaseId === case_.id ? null : case_.id
          )}
          basePath={basePath}
          isStaffOrAdmin={isStaffOrAdmin}
        />
      ))}

      {showActions && filteredCases.length > 0 && (
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