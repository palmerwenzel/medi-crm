/**
 * Active filters display component
 */

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ActiveFiltersProps } from '@/types/filters'

export function ActiveFilters({
  filters,
  onRemoveFilter,
  className
}: ActiveFiltersProps) {
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'sortBy' || key === 'sortOrder') return false
    if (Array.isArray(value)) return value.length > 0
    if (key === 'dateRange') return value?.from || value?.to
    return value !== undefined && value !== 'all' && value !== ''
  })

  if (!hasActiveFilters) return null

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {filters.status && filters.status !== 'all' && (
        <FilterBadge
          label="Status"
          values={Array.isArray(filters.status) ? filters.status : [filters.status]}
          onRemove={() => onRemoveFilter('status')}
        />
      )}
      {filters.priority && filters.priority !== 'all' && (
        <FilterBadge
          label="Priority"
          values={Array.isArray(filters.priority) ? filters.priority : [filters.priority]}
          onRemove={() => onRemoveFilter('priority')}
        />
      )}
      {filters.category && filters.category !== 'all' && (
        <FilterBadge
          label="Category"
          values={Array.isArray(filters.category) ? filters.category : [filters.category]}
          onRemove={() => onRemoveFilter('category')}
        />
      )}
      {filters.department && filters.department !== 'all' && (
        <FilterBadge
          label="Department"
          values={Array.isArray(filters.department) ? filters.department : [filters.department]}
          onRemove={() => onRemoveFilter('department')}
        />
      )}
      {filters.search && (
        <FilterBadge
          label="Search"
          values={[filters.search]}
          onRemove={() => onRemoveFilter('search')}
        />
      )}
      {filters.dateRange?.from && filters.dateRange?.to && (
        <FilterBadge
          label="Date Range"
          values={[`${filters.dateRange.from.toLocaleDateString()} - ${filters.dateRange.to.toLocaleDateString()}`]}
          onRemove={() => onRemoveFilter('dateRange')}
        />
      )}
    </div>
  )
}

interface FilterBadgeProps {
  label: string
  values: string[]
  onRemove: () => void
}

function FilterBadge({ label, values, onRemove }: FilterBadgeProps) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm">
      <span className="font-medium">{label}:</span>
      <span>{values.join(', ')}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-4 w-4 rounded-full p-0 hover:bg-primary/20"
      >
        <X className="h-3 w-3" />
        <span className="sr-only">Remove {label} filter</span>
      </Button>
    </div>
  )
} 