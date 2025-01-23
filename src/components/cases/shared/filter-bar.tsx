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
import type { CaseFilters } from './filter-bar'

interface FilterBarProps {
  onFilterChange: (filters: CaseFilters) => void
  className?: string
}

export function FilterBar({ onFilterChange, className }: FilterBarProps) {
  const [filters, setFilters] = useState<CaseFilters>({
    status: 'all',
    priority: 'all',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  const handleFilterChange = useCallback((key: keyof CaseFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }, [filters, onFilterChange])

  return (
    <div className={className} role="search" aria-label="Case filters">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search cases..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-8"
            aria-label="Search cases"
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
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
          value={filters.priority}
          onValueChange={(value) => handleFilterChange('priority', value)}
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
          value={filters.sortBy}
          onValueChange={(value) => handleFilterChange('sortBy', value)}
          name="sortBy"
        >
          <SelectTrigger className="w-[140px]" aria-label="Sort by field">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Created Date</SelectItem>
            <SelectItem value="updated_at">Updated Date</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sortOrder}
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
            setFilters(defaultFilters)
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