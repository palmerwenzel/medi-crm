/**
 * Type definitions for filtering and sorting functionality
 * @see src/lib/validations/case.ts for base case types
 */

import type { 
  CaseStatus, 
  CasePriority, 
  CaseCategory,
  Department,
  StaffSpecialty,
  CaseQueryParams 
} from '@/lib/validations/case'

/**
 * Represents the filter state for case management views
 */
export interface CaseFilters {
  status?: CaseStatus[] | 'all'
  priority?: CasePriority[] | 'all'
  category?: CaseCategory[] | 'all'
  department?: Department[] | 'all'
  specialties?: StaffSpecialty[] | 'all'
  tags?: string[] | 'all'
  search?: string
  sortBy?: CaseQueryParams['sort_by']
  sortOrder?: CaseQueryParams['sort_order']
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
  sortBy: CaseQueryParams['sort_by']
  /** Current sort order */
  sortOrder: CaseQueryParams['sort_order']
  /** Callback when sort changes */
  onSortChange: (sortBy: CaseQueryParams['sort_by'], sortOrder: CaseQueryParams['sort_order']) => void
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