import type { CasesRow, CasesInsert, CasesUpdate } from '@/lib/validations/cases'
import type { StaffSpecialty } from './users'
import type { 
  DbCase,
  DbCaseStatus,
  DbCasePriority,
  DbCaseCategory,
  DbDepartment,
  DbConversationStatus
} from './db'

// Shared enum types
export type CaseStatus = DbCaseStatus
export type CasePriority = DbCasePriority
export type CaseCategory = DbCaseCategory
export type CaseDepartment = DbDepartment
export type ConversationStatus = DbConversationStatus

// Re-export for convenience
export type { StaffSpecialty }

// Shared field types
export type CaseSortField = keyof DbCase

// Domain-specific metadata interface
export interface CaseMetadata {
  source?: 'web' | 'mobile' | 'phone'
  tags?: string[]
  custom_fields?: Record<string, string | number | boolean>
  last_contact?: string
  follow_up_date?: string
}

// Domain-specific history details
export interface CaseHistoryDetails {
  previous_status?: CaseStatus
  new_status?: CaseStatus
  previous_assigned_to?: string
  new_assigned_to?: string
  comment?: string
  changes?: Record<string, { old: unknown; new: unknown }>
}

// Hook interfaces
export interface CaseManagementOptions {
  limit?: number
  isDashboard?: boolean
}

export interface CaseManagementReturn {
  cases: CasesRow[]
  filteredCases: CasesRow[]
  selectedCases: string[]
  isLoading: boolean
  hasMore: boolean
  loadCases: () => Promise<void>
  loadMore: () => Promise<void>
  handleFilterChange: (filters: CaseFilters) => void
  handleSelectAll: () => void
  handleDeselectAll: () => void
  handleCaseSelect: (id: string) => void
  handleBulkStatusChange: (status: CaseStatus) => Promise<void>
  handleBulkAssignmentChange: (userId: string) => Promise<void>
}

/**
 * Comprehensive filters for case management
 */
export interface CaseFilters {
  search?: string
  status?: CaseStatus | CaseStatus[] | 'all'
  priority?: CasePriority | CasePriority[] | 'all'
  category?: CaseCategory | CaseCategory[] | 'all'
  department?: CaseDepartment | CaseDepartment[] | 'all'
  specialty?: StaffSpecialty | 'all'
  chat_status?: ConversationStatus | 'all'
  tags?: string[] | 'all'
  sortBy?: CaseSortField
  sortOrder?: 'asc' | 'desc'
  dateRange?: {
    from?: Date
    to?: Date
  }
} 