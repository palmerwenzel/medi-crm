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
  DbCaseActivityType,
  DbCaseAssessment,
  DbCaseAssessmentInsert,
  DbCaseAssessmentUpdate,
  DbAssessmentCreatorType,
  DbAssessmentStatus
} from './db'
import type { StaffSpecialty } from './users'
import type { Json } from '../supabase'

/**
 * Core case types and interfaces for medical case management
 */

/**
 * Base case interface extending database case type.
 * Represents the source of truth for case data.
 */
export interface Case extends DbCase {
  attachments: Json | null
  metadata: Json | null
}

/**
 * Enriched case response with joined user and assessment data.
 * Used when displaying case details in the UI.
 */
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
  latest_assessment?: CaseAssessmentResponse
}

/**
 * Case Notes - For internal documentation and updates
 */
export interface CaseNote extends DbCaseNote {}
export type CaseNoteInsert = DbCaseNoteInsert
export type CaseNoteUpdate = DbCaseNoteUpdate

/**
 * Case History - For tracking changes and activities
 */
export interface CaseHistory extends DbCaseHistory {}
export type CaseHistoryInsert = DbCaseHistoryInsert
export type CaseHistoryUpdate = DbCaseHistoryUpdate
export type CaseActivityType = DbCaseActivityType

/**
 * Case history with actor information.
 * Used for displaying who made changes to a case.
 */
export interface CaseHistoryWithActor extends CaseHistory {
  actor: {
    id: string
    first_name: string | null
    last_name: string | null
    role: string
  }
}

/**
 * Types for creating and updating cases
 */
export type CaseInsert = Partial<Case> & {
  category: CaseCategory
  description: string
  patient_id: string
  priority: CasePriority
  status: CaseStatus
  title: string
}

export type CaseUpdate = Partial<CaseInsert>

/**
 * Case Assessment Types - For medical evaluations
 */
export interface CaseAssessment extends DbCaseAssessment {
  case?: Case
  creator?: {
    id: string
    first_name: string | null
    last_name: string | null
    role: string
  }
}

/**
 * Enriched assessment response with joined case and creator data.
 * Used when displaying assessment details.
 */
export interface CaseAssessmentResponse {
  id: string
  key_symptoms: string[]
  recommended_specialties: string[]
  urgency_indicators: string[]
  notes: string | null
  status: AssessmentStatus
  created_at: string
  updated_at: string
  created_by_type: AssessmentCreatorType
  case: CaseResponse
  creator: {
    id: string
    first_name: string | null
    last_name: string | null
    role: string
  }
}

export type CaseAssessmentInsert = DbCaseAssessmentInsert
export type CaseAssessmentUpdate = DbCaseAssessmentUpdate

/**
 * Shared enum types from database layer
 */
export type CaseStatus = DbCaseStatus
export type CasePriority = DbCasePriority
export type CaseCategory = DbCaseCategory
export type CaseDepartment = DbDepartment
export type ConversationStatus = DbConversationStatus
export type AssessmentCreatorType = DbAssessmentCreatorType
export type AssessmentStatus = DbAssessmentStatus

export type { StaffSpecialty }

export type CaseSortField = keyof DbCase

/**
 * Domain-specific metadata interfaces
 */

/**
 * Additional case metadata for tracking source and custom fields
 */
export interface CaseMetadata {
  source?: 'web' | 'mobile' | 'phone'  // Source of case creation
  tags?: string[]                      // Custom tags for categorization
  custom_fields?: Record<string, string | number | boolean>
  last_contact?: string                // Timestamp of last patient contact
  follow_up_date?: string             // Scheduled follow-up date
}

/**
 * Service Level Agreement (SLA) tracking metadata
 */
export interface SLAMetadata {
  sla_breached: boolean               // Whether SLA has been breached
  response_target: string             // Target time for first response
  resolution_target: string           // Target time for resolution
  first_response_at: string | null    // Timestamp of first response
  sla_tier: string                   // SLA tier level
}

/**
 * Details for tracking case history changes
 */
export interface CaseHistoryDetails {
  previous_status?: CaseStatus
  new_status?: CaseStatus
  previous_assigned_to?: string
  new_assigned_to?: string
  comment?: string
  changes?: Record<string, { old: unknown; new: unknown }>
}

/**
 * Hook interfaces for case management
 */
export interface CaseManagementOptions {
  limit?: number
  isDashboard?: boolean
}

/**
 * Return type for case management hook
 */
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
  has_assessment?: boolean
  assessment_creator?: AssessmentCreatorType | 'all'
}

/**
 * Parameters for case queries
 */
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

/**
 * Paginated response for case queries
 */
export interface PaginatedCaseResponse {
  cases: CaseResponse[]
  total: number
  hasMore: boolean
  nextOffset?: number
}

export type CreateCaseInput = CaseInsert 