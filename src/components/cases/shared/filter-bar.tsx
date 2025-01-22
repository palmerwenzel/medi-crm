/**
 * Filter bar component for case management
 * Provides status, priority, and date range filtering
 */
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Search, SlidersHorizontal } from 'lucide-react'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { addDays } from 'date-fns'
import { type DateRange } from 'react-day-picker'

interface FilterBarProps {
  onFilterChange: (filters: CaseFilters) => void
  className?: string
}

export interface CaseFilters {
  search?: string
  status?: string
  priority?: string
  dateRange?: DateRange
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
]

const priorityOptions = [
  { value: 'all', label: 'All Priority' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export function FilterBar({ onFilterChange, className }: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<CaseFilters>({
    search: '',
    status: 'all',
    priority: 'all',
    dateRange: {
      from: new Date(),
      to: addDays(new Date(), 7),
    },
  })

  const handleFilterChange = (newFilters: Partial<CaseFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cases..."
            className="pl-8"
            value={filters.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(showFilters && 'bg-accent')}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border bg-card p-4">
          <Select
            value={filters.status}
            onValueChange={(value: string) => handleFilterChange({ status: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.priority}
            onValueChange={(value: string) => handleFilterChange({ priority: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DatePickerWithRange
            value={filters.dateRange}
            onChange={(range) => handleFilterChange({ dateRange: range })}
          />
        </div>
      )}
    </div>
  )
} 