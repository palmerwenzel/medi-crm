import type { Database } from '../supabase'
import type { 
  NotificationsRow,
  NotificationsInsert,
  NotificationsUpdate 
} from '@/lib/validations/notifications'
import type {
  NotificationPreferencesRow,
  NotificationPreferencesInsert,
  NotificationPreferencesUpdate
} from '@/lib/validations/notification-preferences'

// Base types from database
export type NotificationType = Database['public']['Enums']['notification_type']
export type NotificationPriority = Database['public']['Enums']['notification_priority']
export type NotificationChannel = Database['public']['Enums']['notification_channel']

/**
 * Extended notification type with proper metadata typing
 */
export interface Notification extends Omit<NotificationsRow, 'metadata'> {
  metadata: NotificationMetadata
}

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
 * Extended preferences type with proper date handling
 */
export interface NotificationPreferences extends Omit<NotificationPreferencesRow, 'created_at' | 'updated_at'> {
  created_at: Date
  updated_at: Date
} 