/**
 * Type definitions for filtering and sorting functionality
 * @see src/lib/validations/case.ts for base case types
 */

import type { 
  CaseStatus, 
  CasePriority, 
  CaseCategory,
  CaseDepartment,
  StaffSpecialty,
  CaseSortField 
} from '@/lib/validations/case'

/**
 * Represents the filter state for case management views
 */
export interface CaseFilters {
  status?: CaseStatus | 'all'
  priority?: CasePriority | 'all'
  category?: CaseCategory | 'all'
  department?: CaseDepartment | 'all'
  specialty?: StaffSpecialty | 'all'
  tags?: string[] | 'all'
  search?: string
  sortBy?: CaseSortField
  sortOrder?: 'asc' | 'desc'
  dateRange?: {
    from?: Date
    to?: Date
  }
}

/**
 * Props for the FilterBar component
 */
export interface FilterBarProps {
  /** Current filter state */
  filters: CaseFilters
  /** Callback when filters change */
  onFilterChange: (filters: CaseFilters) => void
  /** Optional className for styling */
  className?: string
}

/**
 * Props for the MultiSelectFilter component
 */
export interface MultiSelectFilterProps<T extends string> {
  /** Current selected values */
  values: T[] | 'all'
  /** Available options to select from */
  options: readonly T[]
  /** Label for the filter */
  label: string
  /** Callback when selection changes */
  onChange: (values: T[] | 'all') => void
  /** Optional className for styling */
  className?: string
  /** Placeholder text for the select input */
  placeholder?: string
  /** Message to show when no options are available */
  emptyMessage?: string
}

/**
 * Props for the DateRangeFilter component
 */
export interface DateRangeFilterProps {
  /** Current date range */
  value?: {
    from?: Date
    to?: Date
  }
  /** Callback when date range changes */
  onChange: (range?: { from?: Date; to?: Date }) => void
  /** Optional className for styling */
  className?: string
}

/**
 * Props for the SortControls component
 */
export interface SortControlsProps {
  /** Current sort field */
  sortBy: CaseSortField
  /** Current sort order */
  sortOrder: 'asc' | 'desc'
  /** Callback when sort changes */
  onSortChange: (sortBy: CaseSortField, sortOrder: 'asc' | 'desc') => void
  /** Optional className for styling */
  className?: string
}

/**
 * Props for the ActiveFilters component
 */
export interface ActiveFiltersProps {
  /** Current filter state */
  filters: CaseFilters
  /** Callback to remove a filter */
  onRemoveFilter: (key: keyof CaseFilters, value?: string) => void
  /** Optional className for styling */
  className?: string
} 