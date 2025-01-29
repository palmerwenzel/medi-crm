import type {
  CaseDepartment,
  CaseSortField,
  CaseFilters,
  StaffSpecialty
} from './cases'
import type {
  StaffMember,
  UserId
} from './users'
import type {
  Notification,
  NotificationPreference
} from './notifications'
import type {
  ConversationId,
  MessageMetadata,
  Message,
  MedicalConversation,
  ChatSessionStatus
} from './chat'

/**
 * UI-specific domain types for the medical system.
 * These types extend domain types with UI-specific fields and behaviors.
 */

/**
 * UI-specific metadata for cases, including SLA tracking and UI state
 */
export interface CaseUIMetadata {
  sla?: {
    response_target: string         // Target time for first response
    resolution_target: string       // Target time for case resolution
    last_updated: string           // Last SLA update timestamp
    sla_breached: boolean          // Whether SLA has been breached
    first_response_at: string | null // Time of first response
    sla_tier: string               // SLA service tier
  }
  tags?: string[]                  // UI tags for filtering/categorization
  internal_notes?: string          // Staff-only notes
  specialties?: string[]           // Medical specialties involved
  chat_status?: 'active' | 'closed' // Chat availability status
}

/**
 * Base interface for all UI component props
 */
export interface BaseProps {
  /** Optional className for styling */
  className?: string
}

/**
 * UI-enhanced medical conversation with additional display fields
 */
export interface UIMedicalConversation extends MedicalConversation {
  topic: string | null             // Conversation topic/subject
  updated_at: string | null        // Last update timestamp
  created_at: string              // Creation timestamp
}

/**
 * Real-time chat presence tracking
 */

/**
 * Typing indicator state for real-time updates
 */
export interface TypingStatus {
  conversationId: ConversationId   // Current conversation
  userId: UserId                  // User who is typing
  isTyping: boolean               // Whether user is currently typing
  timestamp: string               // When typing state last changed
}

/**
 * Real-time presence state tracking who's online
 */
export interface PresenceState {
  [key: string]: {
    user_id: UserId
    online_at: string
  }[]
}

/**
 * Message status tracking for UI display
 */
export const MessageStatuses = ['pending', 'sent', 'delivered', 'read'] as const
export type MessageStatus = (typeof MessageStatuses)[number]

/**
 * Message state for optimistic updates and error handling
 */
export type MessageState = 
  | { status: 'sending'; tempId: string }  // Message being sent
  | { status: 'sent'; id: string }         // Successfully sent
  | { status: 'error'; error: string }     // Failed to send

/**
 * UI-enhanced message with delivery status and state
 */
export interface UIMessage extends Omit<Message, 'metadata'> {
  conversation_id: ConversationId
  state: MessageState
  metadata: MessageMetadata & {
    status: MessageStatus
  }
}

/**
 * UI-specific chat session with unread count and status
 */
export interface UIChatSession {
  id: ConversationId
  messages: Message[]
  access: MedicalConversation['access']
  unread_count: number            // Number of unread messages
  status: ChatSessionStatus
  messageCount: number            // Total message count
  lastMessageAt: Date            // Timestamp of last message
}

/**
 * Props interfaces for UI components
 */

/**
 * Props for case filtering components
 */
export interface FilterBarProps extends BaseProps {
  /** Current filter state */
  filters: CaseFilters
  /** Callback when filters change */
  onFilterChange: (filters: CaseFilters) => void
}

/**
 * Props for multi-select filter components
 */
export interface MultiSelectFilterProps<T extends string> extends BaseProps {
  /** Current selected values */
  values: T[] | 'all'
  /** Available options to select from */
  options: readonly T[]
  /** Label for the filter */
  label: string
  /** Callback when selection changes */
  onChange: (values: T[] | 'all') => void
  /** Placeholder text for the select input */
  placeholder?: string
  /** Message to show when no options are available */
  emptyMessage?: string
}

/**
 * Props for date range filter components
 */
export interface DateRangeFilterProps extends BaseProps {
  /** Current date range */
  value?: {
    from?: Date
    to?: Date
  }
  /** Callback when date range changes */
  onChange: (range?: { from?: Date; to?: Date }) => void
}

/**
 * Props for sort control components
 */
export interface SortControlsProps extends BaseProps {
  /** Current sort field */
  sortBy: CaseSortField
  /** Current sort order */
  sortOrder?: 'asc' | 'desc'
  /** Callback when sort changes */
  onSortChange: (sortBy: CaseSortField, sortOrder: 'asc' | 'desc') => void
}

/**
 * Props for active filters display
 */
export interface ActiveFiltersProps extends BaseProps {
  /** Current filter state */
  filters: CaseFilters
  /** Callback to remove a filter */
  onRemoveFilter: (key: keyof CaseFilters, value?: string) => void
}

/**
 * Props for staff-related components
 */

/**
 * Props for staff selection components
 */
export interface StaffSelectProps extends BaseProps {
  /** Currently selected staff member */
  value?: UserId
  /** List of available staff members */
  staff: StaffMember[]
  /** Callback when selection changes */
  onChange: (staffId: UserId) => void
  /** Optional filter by specialty */
  specialty?: StaffSpecialty
  /** Optional filter by department */
  department?: CaseDepartment
}

/**
 * Props for staff list display
 */
export interface StaffListProps extends BaseProps {
  /** List of staff members to display */
  staff: StaffMember[]
  /** Optional filter by specialty */
  specialty?: StaffSpecialty
  /** Optional filter by department */
  department?: CaseDepartment
}

/**
 * Props for notification-related components
 */

/**
 * Props for notification list display
 */
export interface NotificationListProps extends BaseProps {
  notifications: Notification[]
  onNotificationClick: (notification: Notification) => void
  onMarkAsRead: (id: string) => Promise<void>
}

/**
 * Props for notification preferences form
 */
export interface NotificationPreferencesFormProps extends BaseProps {
  preferences: NotificationPreference[]
  onPreferenceChange: (preference: NotificationPreference) => Promise<void>
}

/**
 * Props for notification count badge
 */
export interface NotificationBadgeProps extends BaseProps {
  count: number
}

/**
 * Props for chat-related components
 */

/**
 * Props for individual chat message display
 */
export interface ChatMessageProps extends BaseProps {
  message: UIMessage
  session: UIChatSession
  onRetry?: (message: UIMessage) => Promise<void>
}

/**
 * Props for chat session container
 */
export interface ChatSessionProps extends BaseProps {
  session: UIChatSession
  onSendMessage: (content: string) => Promise<void>
  onEndSession?: () => Promise<void>
}

/**
 * Props for chat input component
 */
export interface ChatInputProps extends BaseProps {
  onSend: (content: string) => Promise<void>
  disabled?: boolean
  placeholder?: string
}

/**
 * Props for chat message list display
 */
export interface ChatMessageListProps extends BaseProps {
  messages: UIMessage[]
  onRetry?: (message: UIMessage) => Promise<void>
  showTimestamps?: boolean
}

/**
 * Props for typing indicator display
 */
export interface ChatTypingIndicatorProps extends BaseProps {
  typingState: TypingStatus
  presenceState: PresenceState
}

/**
 * Case summary for patient consent dialog
 */
export interface CaseSummary {
  title: string                    // Case title
  description: string              // Case description
  key_symptoms: string[]           // Main symptoms
  severity: string                 // Severity level
  duration: string                 // Duration of symptoms
  urgency_level: 'emergency' | 'routine' // Urgency assessment
}

/**
 * Type for structured logging data in chat system
 */
export type LogData = 
  | string
  | number
  | boolean
  | null
  | undefined
  | { [key: string]: unknown }
  | object
  | LogData[] 