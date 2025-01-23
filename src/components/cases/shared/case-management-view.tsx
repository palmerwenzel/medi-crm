/**
 * Case Management View Component
 * Advanced list view with filtering, bulk actions, and role-based controls
 * Used for detailed case management in both dashboard and full views
 * Access control handled by RLS policies and useAuth hook
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { FilterBar } from '@/components/cases/shared/filter-bar'
import { StaffToolbar } from '@/components/cases/staff/staff-toolbar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import { CaseListItem } from './case-list-item/index'
import { useCaseManagement } from '@/hooks/cases/use-case-management'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { CaseFilters } from '@/types/filters'
import { BulkOperationsBar } from './bulk-operations'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { CaseResponse } from '@/lib/validations/case'

interface CaseManagementViewProps {
  basePath?: string
  showNotes?: boolean
  isDashboard?: boolean
  showActions?: boolean
  className?: string
  viewType?: 'staff' | 'patient'
  showBulkActions?: boolean
  showStaffTools?: boolean
  limit?: number
}

// Loading skeleton for case items
function CaseItemSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <div className="pt-4">
          <Skeleton className="h-4 w-4 rounded" />
        </div>
        <div className="flex-1">
          <div className="space-y-3 rounded-lg border p-6 backdrop-blur-[2px] bg-background/95">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CaseManagementView({ 
  basePath = '/cases', 
  showNotes = false, 
  isDashboard = false,
  showActions = true,
  className,
  viewType,
  showBulkActions = false,
  showStaffTools = false,
  limit
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

  // If viewType is not specified, infer from userRole
  const effectiveViewType = viewType || (userRole === 'staff' ? 'staff' : 'patient')

  const {
    cases,
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
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[400px]" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
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

      <div 
        className="space-y-2" 
        role="list" 
        aria-label="Case list"
        aria-live="polite"
      >
        {filteredCases.map((case_) => (
          <motion.div
            key={case_.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <CaseListItem
              case_={case_}
              isSelected={selectedCases.includes(case_.id)}
              onSelect={handleCaseSelect}
              showNotes={showNotes}
              basePath={basePath}
              isStaffOrAdmin={userRole === 'staff' || userRole === 'admin'}
            />
          </motion.div>
        ))}
        {hasMore && (
          <div 
            ref={ref} 
            className="h-20 flex items-center justify-center"
            aria-hidden="true"
          >
            <Skeleton className="h-12 w-full" />
          </div>
        )}
        {!hasMore && filteredCases.length === 0 && (
          <div 
            className="text-center py-8 text-muted-foreground"
            role="status"
            aria-label="No cases found"
          >
            No cases found
          </div>
        )}
      </div>

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