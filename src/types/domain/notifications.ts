import type { 
  DbNotification,
  DbNotificationType,
  DbNotificationPriority,
  DbNotificationChannel,
  DbNotificationPreference
} from './db'

// Base types from database layer
export type NotificationType = DbNotificationType
export type NotificationPriority = DbNotificationPriority
export type NotificationChannel = DbNotificationChannel

/**
 * Extended notification type with proper metadata typing
 */
export interface Notification extends Omit<DbNotification, 'metadata'> {
  metadata: NotificationMetadata
}

export type NotificationInsert = Partial<DbNotification> & {
  type: NotificationType
  user_id: string
  title: string
  body: string
}

export type NotificationUpdate = Partial<NotificationInsert>

/**
 * Strongly typed metadata for different notification types
 */
export interface NotificationMetadata {
  case?: {
    id: string
    title: string
    status: string
  }
  message?: {
    id: string
    conversation_id: string
    preview: string
  }
  handoff?: {
    from_ai: boolean
    reason: string
    urgency: string
  }
}

/**
 * User notification preferences
 */
export interface NotificationPreference extends DbNotificationPreference {
  channels: NotificationChannel[]
}

export type NotificationPreferenceInsert = Partial<DbNotificationPreference> & {
  user_id: string
  type: NotificationType
  channels: NotificationChannel[]
}

export type NotificationPreferenceUpdate = Partial<NotificationPreferenceInsert>

/**
 * Helper type for notification settings form
 */
export interface NotificationSettings {
  preferences: NotificationPreference[]
  channels: {
    [K in NotificationChannel]: boolean
  }
  types: {
    [K in NotificationType]: {
      enabled: boolean
      priority: NotificationPriority
    }
  }
} 