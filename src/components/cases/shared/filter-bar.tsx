/**
 * Filter bar component for case management
 * Provides advanced filtering and sorting capabilities
 * Supports filter preferences and multiple selections
 */
'use client'

import { RotateCcw, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useFilterPreferences } from './hooks/use-filter-preferences'
import { MultiSelectFilter } from './filters/multi-select-filter'
import { DateRangeFilter } from './filters/date-range-filter'
import { SortControls } from './filters/sort-controls'
import { ActiveFilters } from './filters/active-filters'
import { TagFilter } from './filters/tag-filter'
import type { FilterBarProps } from '@/types/filters'
import {
  caseStatusEnum,
  casePriorityEnum,
  caseCategoryEnum,
  caseDepartmentEnum,
  staffSpecialtyEnum,
  type StaffSpecialty,
  type CaseStatus,
  type CasePriority,
  type CaseCategory,
  type CaseDepartment
} from '@/lib/validations/case'

export function FilterBar({
  filters,
  onFilterChange,
  className
}: FilterBarProps) {
  const {
    isLoading,
    isSaving,
    savePreferences,
    resetFilters
  } = useFilterPreferences({
    onFilterChange,
    initialFilters: filters
  })

  const handleRemoveFilter = (key: keyof typeof filters, value?: string) => {
    onFilterChange({
      ...filters,
      [key]: value ? filters[key] : undefined
    })
  }

  const handleMultiSelectChange = <T extends string>(
    key: keyof typeof filters,
    values: T[] | 'all'
  ) => {
    onFilterChange({
      ...filters,
      [key]: values === 'all' || values.length === 0 ? 'all' : values[0]
    })
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <MultiSelectFilter
          label="Status"
          options={caseStatusEnum}
          values={filters.status === 'all' ? 'all' : [filters.status as CaseStatus]}
          onChange={values => handleMultiSelectChange('status', values)}
        />
        <MultiSelectFilter
          label="Priority"
          options={casePriorityEnum}
          values={filters.priority === 'all' ? 'all' : [filters.priority as CasePriority]}
          onChange={values => handleMultiSelectChange('priority', values)}
        />
        <MultiSelectFilter
          label="Category"
          options={caseCategoryEnum}
          values={filters.category === 'all' ? 'all' : [filters.category as CaseCategory]}
          onChange={values => handleMultiSelectChange('category', values)}
        />
        <MultiSelectFilter
          label="Department"
          options={caseDepartmentEnum}
          values={filters.department === 'all' ? 'all' : [filters.department as CaseDepartment]}
          onChange={values => handleMultiSelectChange('department', values)}
        />
        <Select
          onValueChange={value => onFilterChange({ ...filters, specialty: value === 'all' ? 'all' : value as StaffSpecialty })}
          value={filters.specialty || 'all'}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            {staffSpecialtyEnum.map((specialty: StaffSpecialty) => (
              <SelectItem key={specialty} value={specialty}>
                {specialty.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <TagFilter
          values={filters.tags === 'all' ? 'all' : Array.isArray(filters.tags) ? filters.tags : []}
          onChange={values => onFilterChange({ ...filters, tags: values })}
        />
        <DateRangeFilter
          value={filters.dateRange}
          onChange={range => onFilterChange({ ...filters, dateRange: range })}
        />
        <SortControls
          sortBy={filters.sortBy || 'created_at'}
          sortOrder={filters.sortOrder || 'desc'}
          onSortChange={(sortBy, sortOrder) => onFilterChange({ ...filters, sortBy, sortOrder })}
        />
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={resetFilters}
            disabled={isLoading}
          >
            <RotateCcw className="h-4 w-4" />
            <span className="sr-only">Reset filters</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={savePreferences}
            disabled={isLoading || isSaving}
          >
            <Save className="h-4 w-4" />
            <span className="sr-only">Save filter preferences</span>
          </Button>
        </div>
      </div>
      <ActiveFilters
        filters={filters}
        onRemoveFilter={handleRemoveFilter}
      />
    </div>
  )
} 