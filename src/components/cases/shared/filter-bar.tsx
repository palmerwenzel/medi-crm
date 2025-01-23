/**
 * Filter bar component for case management
 * Provides status, priority, and date range filtering
 * Customizes available filters based on user role
 */
'use client'

import { useState, useCallback } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CaseStatus, CasePriority, CaseQueryParams } from '@/lib/validations/case'

// UI-friendly version of CaseQueryParams
export interface CaseFilters {
  status?: CaseStatus | 'all'
  priority?: CasePriority | 'all'
  search?: string
  sortBy?: CaseQueryParams['sort_by']
  sortOrder?: CaseQueryParams['sort_order']
  dateRange?: CaseQueryParams['date_range']
}

interface FilterBarProps {
  filters: CaseFilters
  onFilterChange: (filters: CaseFilters) => void
  className?: string
}

export function FilterBar({ filters, onFilterChange, className }: FilterBarProps) {
  const [localFilters, setLocalFilters] = useState<CaseFilters>({
    status: 'all',
    priority: 'all',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  const handleFilterChange = useCallback((key: keyof CaseFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }, [localFilters, onFilterChange])

  return (
    <div className={className} role="search" aria-label="Case filters">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search cases..."
            value={localFilters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-8"
            aria-label="Search cases"
          />
        </div>

        <Select
          value={localFilters.status}
          onValueChange={(value) => handleFilterChange('status', value as CaseStatus | 'all')}
          name="status"
        >
          <SelectTrigger className="w-[140px]" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={localFilters.priority}
          onValueChange={(value) => handleFilterChange('priority', value as CasePriority | 'all')}
          name="priority"
        >
          <SelectTrigger className="w-[140px]" aria-label="Filter by priority">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={localFilters.sortBy}
          onValueChange={(value) => handleFilterChange('sortBy', value as 'created_at' | 'updated_at' | 'priority')}
          name="sortBy"
        >
          <SelectTrigger className="w-[140px]" aria-label="Sort by field">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Created Date</SelectItem>
            <SelectItem value="updated_at">Updated Date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={localFilters.sortOrder}
          onValueChange={(value) => handleFilterChange('sortOrder', value as 'asc' | 'desc')}
          name="sortOrder"
        >
          <SelectTrigger className="w-[140px]" aria-label="Sort order">
            <SelectValue placeholder="Sort order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest First</SelectItem>
            <SelectItem value="asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => {
            const defaultFilters: CaseFilters = {
              status: 'all',
              priority: 'all',
              search: '',
              sortBy: 'created_at',
              sortOrder: 'desc'
            }
            setLocalFilters(defaultFilters)
            onFilterChange(defaultFilters)
          }}
          aria-label="Reset all filters"
        >
          Reset Filters
        </Button>
      </div>
    </div>
  )
} 