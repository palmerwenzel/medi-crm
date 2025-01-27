/**
 * Root Types Index
 * 
 * This file re-exports all types needed by the application,
 * organized by domain and layer.
 */

// Re-export all domain types (use this for comprehensive imports)
export * from './domain'

/**
 * Selective exports by domain
 * These are commonly used types that are exported directly for convenience
 */

// User & Auth types
export type { 
  User,
  AuthUser,
  UserRole,
  UserWithAuth,
  StaffMember,
  StaffSpecialty,
  UserId
} from './domain/users'

// Case Management types
export type {
  CaseStatus,
  CasePriority,
  CaseCategory,
  CaseDepartment,
  CaseMetadata,
  CaseHistoryDetails,
  CaseManagementOptions,
  CaseManagementReturn,
  CaseFilters,
  CaseSortField
} from './domain/cases'

// Chat & Messaging types
export type {
  ChatSession,
  ChatAccess,
  MessageMetadata,
  MessageRole,
  ConversationId,
  ChatSessionStatus,
  HandoffStatus,
  TriageDecision
} from './domain/chat'

// AI types and guards
export type {
  ChatRequest,
  ChatResponse
} from './domain/ai'

export {
  isAIProcessingMetadata,
  isHandoffMetadata,
  isProviderAccess,
  isBothAccess
} from './domain/ai'

// Constants
export {
  MessageRoles,
  ChatSessionStatuses,
  HandoffStatuses,
  TriageDecisions
} from './domain/chat'

// UI types
export type {
  // Base Props
  BaseProps,
  
  // Message UI
  UIMessage,
  MessageState,
  MessageStatus,
  UIChatSession,
  
  // Case UI
  FilterBarProps,
  MultiSelectFilterProps,
  DateRangeFilterProps,
  SortControlsProps,
  ActiveFiltersProps,
  
  // Staff UI
  StaffSelectProps,
  StaffListProps,
  
  // Chat UI
  ChatMessageProps,
  ChatSessionProps,
  ChatInputProps,
  ChatMessageListProps,
  ChatTypingIndicatorProps,
  
  // Real-time UI
  TypingStatus,
  PresenceState,
  
  // Notification UI
  NotificationListProps,
  NotificationPreferencesFormProps,
  NotificationBadgeProps
} from './domain/ui'

// Notification domain types
export type {
  Notification,
  NotificationMetadata,
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  NotificationPreference
} from './domain/notifications'

/**
 * Type Import Guidelines:
 * 
 * 1. For comprehensive type coverage, import everything:
 *    import type * as Types from '@/types'
 * 
 * 2. For specific domains, use selective imports:
 *    import type { User, AuthUser } from '@/types'
 * 
 * 3. For UI components, import from here rather than domain/ui directly:
 *    import type { BaseProps, ChatMessageProps } from '@/types'
 */