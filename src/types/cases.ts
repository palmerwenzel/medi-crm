/**
 * Type definitions for case management functionality
 */

import type { 
  CaseResponse, 
  CaseStatus, 
  CasePriority,
  CaseCategory,
  CaseDepartment,
  StaffSpecialty,
  CaseSortField
} from '@/lib/validations/case'
import type { StaffMember } from '@/types/staff'

/**
 * Options for initializing the case management hook
 */
export interface CaseManagementOptions {
  /** Maximum number of cases to load at once */
  limit?: number
  /** Whether this is being used in a dashboard context */
  isDashboard?: boolean
}

/**
 * Return type for the case management hook
 */
export interface CaseManagementReturn {
  /** List of all cases */
  cases: CaseResponse[]
  /** Filtered subset of cases based on current filters */
  filteredCases: CaseResponse[]
  /** IDs of currently selected cases */
  selectedCases: string[]
  /** List of staff members for assignment */
  staffMembers: StaffMember[]
  /** Whether cases are currently loading */
  isLoading: boolean
  /** Whether more cases can be loaded */
  hasMore: boolean
  /** Function to load/reload cases */
  loadCases: () => Promise<void>
  /** Function to load more cases (pagination) */
  loadMore: () => Promise<void>
  /** Function to handle filter changes */
  handleFilterChange: (filters: CaseFilters) => void
  /** Function to select all visible cases */
  handleSelectAll: () => void
  /** Function to deselect all cases */
  handleDeselectAll: () => void
  /** Function to toggle selection of a single case */
  handleCaseSelect: (id: string) => void
  /** Function to change status of selected cases */
  handleBulkStatusChange: (status: CaseStatus) => Promise<void>
  /** Function to assign selected cases to a staff member */
  handleBulkAssignmentChange: (userId: string) => Promise<void>
}

/**
 * Filters that can be applied to cases
 */
export interface CaseFilters {
  /** Search text to filter by title/description */
  search?: string
  /** Status filter */
  status?: CaseStatus | CaseStatus[] | 'all'
  /** Priority filter */
  priority?: CasePriority | CasePriority[] | 'all'
  /** Category filter */
  category?: CaseCategory | CaseCategory[] | 'all'
  /** Department filter */
  department?: CaseDepartment | CaseDepartment[] | 'all'
  /** Specialty filter */
  specialties?: StaffSpecialty | StaffSpecialty[] | 'all'
  /** Sort field */
  sortBy?: CaseSortField
  /** Sort direction */
  sortOrder?: 'asc' | 'desc'
  /** Date range filter */
  dateRange?: {
    from?: Date
    to?: Date
  }
} 