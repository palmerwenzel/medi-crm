import React from 'react'
import { useCaseManagement as useCases } from '@/hooks/cases/use-case-management'
import { BulkOperationsBar } from './shared/bulk-operations'
import { StaffToolbar } from './staff/staff-toolbar'
import { CaseListItem } from './shared/case-list-item'
import { useAuth } from '@/providers/auth-provider'

export interface CaseManagementViewProps {
  isDashboard?: boolean
  viewType: 'patient' | 'staff' | 'admin'
  showBulkActions?: boolean
  showStaffTools?: boolean
  limit?: number
}

export function CaseManagementView({
  isDashboard = false,
  viewType,
  showBulkActions = false,
  showStaffTools = false,
  limit = 20
}: CaseManagementViewProps) {
  const { userRole } = useAuth()
  const { 
    cases, 
    isLoading, 
    selectedCases,
    staffMembers,
    handleBulkStatusChange,
    handleBulkAssignmentChange,
    handleDeselectAll,
    handleCaseSelect
  } = useCases({
    limit,
    isDashboard
  })

  const isStaffOrAdmin = userRole === 'staff' || userRole === 'admin'

  return (
    <div className="space-y-4">
      {showBulkActions && (
        <BulkOperationsBar 
          selectedCount={selectedCases.length}
          staffMembers={staffMembers}
          onStatusChange={handleBulkStatusChange}
          onAssignmentChange={handleBulkAssignmentChange}
          onDeselectAll={handleDeselectAll}
        />
      )}
      
      {showStaffTools && viewType !== 'patient' && (
        <StaffToolbar 
          selectedCases={selectedCases} 
          onUpdate={handleDeselectAll}
        />
      )}

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg border bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map(case_ => (
            <CaseListItem 
              key={case_.id}
              case_={case_}
              isSelected={selectedCases.includes(case_.id)}
              onSelect={handleCaseSelect}
              isStaffOrAdmin={isStaffOrAdmin}
            />
          ))}
        </div>
      )}
    </div>
  )
} 