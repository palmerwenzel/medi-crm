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
 * Base Props interface for UI components
 */
export interface BaseProps {
  /** Optional className for styling */
  className?: string
}

// UI-specific conversation type
export interface UIMedicalConversation extends MedicalConversation {
  topic: string | null
  updated_at: string | null
  created_at: string
}

// Real-time presence types
export interface TypingStatus {
  conversationId: ConversationId
  userId: UserId
  isTyping: boolean
  timestamp: string
}

export interface PresenceState {
  [key: string]: {
    user_id: UserId
    online_at: string
  }[]
}

// UI-specific message types
export const MessageStatuses = ['pending', 'sent', 'delivered', 'read'] as const
export type MessageStatus = (typeof MessageStatuses)[number]

export type MessageState = 
  | { status: 'sending'; tempId: string }
  | { status: 'sent'; id: string }
  | { status: 'error'; error: string }

export interface UIMessage extends Omit<Message, 'metadata'> {
  conversation_id: ConversationId
  state: MessageState
  metadata: MessageMetadata & {
    status: MessageStatus
  }
}

// UI-specific chat session type
export interface UIChatSession {
  id: ConversationId
  messages: Message[]
  access: MedicalConversation['access']
  unread_count: number
  status: ChatSessionStatus
  messageCount: number
  lastMessageAt: Date
}

/**
 * Case-related Props
 */
export interface FilterBarProps extends BaseProps {
  /** Current filter state */
  filters: CaseFilters
  /** Callback when filters change */
  onFilterChange: (filters: CaseFilters) => void
}

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

export interface DateRangeFilterProps extends BaseProps {
  /** Current date range */
  value?: {
    from?: Date
    to?: Date
  }
  /** Callback when date range changes */
  onChange: (range?: { from?: Date; to?: Date }) => void
}

export interface SortControlsProps extends BaseProps {
  /** Current sort field */
  sortBy: CaseSortField
  /** Current sort order */
  sortOrder?: 'asc' | 'desc'
  /** Callback when sort changes */
  onSortChange: (sortBy: CaseSortField, sortOrder: 'asc' | 'desc') => void
}

export interface ActiveFiltersProps extends BaseProps {
  /** Current filter state */
  filters: CaseFilters
  /** Callback to remove a filter */
  onRemoveFilter: (key: keyof CaseFilters, value?: string) => void
}

/**
 * Staff-related Props
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

export interface StaffListProps extends BaseProps {
  /** List of staff members to display */
  staff: StaffMember[]
  /** Optional filter by specialty */
  specialty?: StaffSpecialty
  /** Optional filter by department */
  department?: CaseDepartment
}

/**
 * Notification-related Props
 */
export interface NotificationListProps extends BaseProps {
  notifications: Notification[]
  onNotificationClick: (notification: Notification) => void
  onMarkAsRead: (id: string) => Promise<void>
}

export interface NotificationPreferencesFormProps extends BaseProps {
  preferences: NotificationPreference[]
  onPreferenceChange: (preference: NotificationPreference) => Promise<void>
}

export interface NotificationBadgeProps extends BaseProps {
  count: number
}

/**
 * Chat-related Props
 */
export interface ChatMessageProps extends BaseProps {
  message: UIMessage
  session: UIChatSession
  onRetry?: (message: UIMessage) => Promise<void>
}

export interface ChatSessionProps extends BaseProps {
  session: UIChatSession
  onSendMessage: (content: string) => Promise<void>
  onEndSession?: () => Promise<void>
}

export interface ChatInputProps extends BaseProps {
  onSend: (content: string) => Promise<void>
  disabled?: boolean
  placeholder?: string
}

export interface ChatMessageListProps extends BaseProps {
  messages: UIMessage[]
  onRetry?: (message: UIMessage) => Promise<void>
  showTimestamps?: boolean
}

export interface ChatTypingIndicatorProps extends BaseProps {
  typingState: TypingStatus
  presenceState: PresenceState
} 