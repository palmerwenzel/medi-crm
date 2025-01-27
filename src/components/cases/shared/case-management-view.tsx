/**
 * Case Management View Component
 * Advanced list view with filtering, bulk actions, and role-based controls
 * Used for detailed case management in both dashboard and full views
 * Access control handled by RLS policies and useAuth hook
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { FilterBar } from '@/components/cases/shared/filter-bar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/providers/auth-provider'
import { useCaseManagement } from './hooks/use-case-management'
import { useInView } from 'react-intersection-observer'
import { CaseFilters } from '@/types/domain/cases'
import { BulkOperationsBar } from './bulk-operations'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { CaseListViewer } from './case-list-viewer'

interface CaseManagementViewProps {
  basePath?: string
  showNotes?: boolean
  isDashboard?: boolean
  showActions?: boolean
  className?: string
}

export function CaseManagementView({ 
  basePath = '/cases', 
  showNotes = false, 
  isDashboard = false,
  showActions = true,
  className,
}: CaseManagementViewProps) {
  const { userRole } = useAuth()
  const { ref, inView } = useInView()
  const [filters, setFilters] = useState<CaseFilters>({
    status: 'all',
    priority: 'all',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  const {
    filteredCases,
    selectedCases,
    isLoading,
    hasMore,
    loadMore,
    handleFilterChange,
    handleSelectAll,
    handleDeselectAll,
    handleCaseSelect,
    handleBulkStatusChange,
    handleBulkAssignmentChange,
    staffMembers
  } = useCaseManagement({ isDashboard })

  // Handle filter changes
  const onFilterChange = useCallback((newFilters: CaseFilters) => {
    setFilters(newFilters)
    handleFilterChange(newFilters)
  }, [handleFilterChange])

  // Load more cases when scrolling to the bottom
  useEffect(() => {
    if (inView && hasMore) {
      loadMore()
    }
  }, [inView, hasMore, loadMore])

  // Handle keyboard shortcuts for bulk actions
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Only handle shortcuts if cases are selected
    if (selectedCases.length === 0) return

    // Ctrl/Cmd + A to select all
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault()
      handleSelectAll()
    }
    // Escape to deselect all
    else if (e.key === 'Escape') {
      e.preventDefault()
      handleDeselectAll()
    }
  }, [selectedCases.length, handleSelectAll, handleDeselectAll])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (isLoading) {
    return (
      <div className={cn('flex flex-col h-full', className)}>
        <Card className="p-6 mb-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[400px]" />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="flex items-center justify-between mb-4">
        <FilterBar 
          filters={filters} 
          onFilterChange={onFilterChange} 
        />
        {showActions && selectedCases.length > 0 && (
          <div className="flex items-center gap-2" role="toolbar" aria-label="Bulk actions">
            <Button 
              variant="outline" 
              onClick={handleDeselectAll}
              aria-label={`Clear selection of ${selectedCases.length} cases`}
            >
              Clear Selection ({selectedCases.length})
            </Button>
            {userRole === 'admin' && (
              <>
                <Button 
                  onClick={() => handleBulkStatusChange('in_progress')}
                  aria-label={`Mark ${selectedCases.length} cases as in progress`}
                >
                  Mark In Progress
                </Button>
                <Button 
                  onClick={() => handleBulkStatusChange('resolved')}
                  aria-label={`Mark ${selectedCases.length} cases as resolved`}
                >
                  Mark Resolved
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <Card className="flex-1 min-h-0 border-0 bg-transparent shadow-none">
        <CaseListViewer
          cases={filteredCases}
          selectedCases={selectedCases}
          onSelect={handleCaseSelect}
          showNotes={showNotes}
          basePath={basePath}
          isStaffOrAdmin={userRole === 'staff' || userRole === 'admin'}
          hasMore={hasMore}
          loadMoreRef={ref}
        />
      </Card>

      {showActions && selectedCases.length > 0 && (
        <BulkOperationsBar
          selectedCount={selectedCases.length}
          staffMembers={staffMembers}
          onStatusChange={handleBulkStatusChange}
          onAssignmentChange={handleBulkAssignmentChange}
          onDeselectAll={handleDeselectAll}
        />
      )}
    </div>
  )
} 