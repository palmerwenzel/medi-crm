import type { 
  DbNotification,
  DbNotificationType,
  DbNotificationPriority,
  DbNotificationChannel,
  DbNotificationPreference
} from './db'

/**
 * Domain types for the notification system, handling alerts and preferences
 * across different channels and notification types.
 */

/**
 * Core notification type definitions from database layer
 */
export type NotificationType = DbNotificationType    // Type of notification (e.g., 'case_update', 'message_received')
export type NotificationPriority = DbNotificationPriority  // Priority level (e.g., 'high', 'medium', 'low')
export type NotificationChannel = DbNotificationChannel   // Delivery channel (e.g., 'email', 'in_app', 'sms')

/**
 * Core notification interface with strongly typed metadata.
 * Extends database notification but enforces proper metadata structure.
 */
export interface Notification extends Omit<DbNotification, 'metadata'> {
  metadata: NotificationMetadata
}

/**
 * Required fields for creating a new notification
 */
export type NotificationInsert = Partial<DbNotification> & {
  type: NotificationType     // Type of notification being created
  user_id: string           // User to receive the notification
  title: string             // Notification title/header
  body: string              // Main notification content
}

export type NotificationUpdate = Partial<NotificationInsert>

/**
 * Strongly typed metadata for different notification scenarios.
 * Each property represents a different context where notifications occur.
 */
export interface NotificationMetadata {
  case?: {
    id: string              // Associated case ID
    title: string           // Case title
    status: string          // Current case status
  }
  message?: {
    id: string              // Message ID
    conversation_id: string // Parent conversation
    preview: string         // Message preview/snippet
  }
  handoff?: {
    from_ai: boolean        // Whether handoff is from AI
    reason: string          // Reason for handoff
    urgency: string         // Urgency level of handoff
  }
}

/**
 * User preferences for notification delivery
 */
export interface NotificationPreference extends DbNotificationPreference {
  channels: NotificationChannel[]  // User's preferred delivery channels
}

/**
 * Required fields for creating a new notification preference
 */
export type NotificationPreferenceInsert = Partial<DbNotificationPreference> & {
  user_id: string                  // User these preferences belong to
  type: NotificationType           // Notification type being configured
  channels: NotificationChannel[]  // Selected delivery channels
}

export type NotificationPreferenceUpdate = Partial<NotificationPreferenceInsert>

/**
 * Complete notification settings structure for user preferences.
 * Used in the notification settings UI to manage all preferences.
 */
export interface NotificationSettings {
  preferences: NotificationPreference[]  // List of all notification preferences
  channels: {
    [K in NotificationChannel]: boolean  // Enabled/disabled state for each channel
  }
  types: {
    [K in NotificationType]: {          // Settings for each notification type
      enabled: boolean                  // Whether this type is enabled
      priority: NotificationPriority    // Priority level for this type
    }
  }
} 