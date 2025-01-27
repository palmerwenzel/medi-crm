import type { 
  DbCase,
  DbCaseStatus,
  DbCasePriority,
  DbCaseCategory,
  DbDepartment,
  DbConversationStatus,
  DbCaseNote,
  DbCaseNoteInsert,
  DbCaseNoteUpdate,
  DbCaseHistory,
  DbCaseHistoryInsert,
  DbCaseHistoryUpdate,
  DbCaseActivityType
} from './db'
import type { StaffSpecialty } from './users'
import type { Json } from '../supabase'

// Base case types (source of truth)
export interface Case extends DbCase {
  attachments: Json | null
  metadata: Json | null
}

// Case response type (with joined fields)
export interface CaseResponse {
  id: string
  assigned_to: {
    id: string
    first_name: string | null
    last_name: string | null
    role: string
    specialty: string | null
  } | null
  attachments: Json | null
  category: CaseCategory
  created_at: string
  department: CaseDepartment | null
  description: string
  internal_notes: string | null
  metadata: Json | null
  patient: {
    id: string
    first_name: string | null
    last_name: string | null
  } | null
  patient_id: string
  priority: CasePriority
  status: CaseStatus
  title: string
  updated_at: string
}

// Case notes types
export interface CaseNote extends DbCaseNote {}
export type CaseNoteInsert = DbCaseNoteInsert
export type CaseNoteUpdate = DbCaseNoteUpdate

// Case history types
export interface CaseHistory extends DbCaseHistory {}
export type CaseHistoryInsert = DbCaseHistoryInsert
export type CaseHistoryUpdate = DbCaseHistoryUpdate
export type CaseActivityType = DbCaseActivityType

export type CaseInsert = Partial<Case> & {
  category: CaseCategory
  description: string
  patient_id: string
  priority: CasePriority
  status: CaseStatus
  title: string
}

export type CaseUpdate = Partial<CaseInsert>

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
  cases: CaseResponse[]
  filteredCases: CaseResponse[]
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

export interface CaseQueryParams {
  limit?: number
  offset?: number
  sort_by?: CaseSortField
  sort_order?: 'asc' | 'desc'
  status?: CaseStatus
  priority?: CasePriority
  category?: CaseCategory
  department?: CaseDepartment
  assigned_to?: string
  search?: string
}

export interface PaginatedCaseResponse {
  cases: CaseResponse[]
  total: number
  hasMore: boolean
  nextOffset?: number
}

export type CreateCaseInput = CaseInsert 