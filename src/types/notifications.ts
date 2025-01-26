export type NotificationType = 
  | 'new_message'
  | 'case_assigned'
  | 'case_updated'
  | 'emergency_alert'
  | 'handoff_request'

export type NotificationPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent'

export type NotificationChannel = 
  | 'in_app'
  | 'email'
  | 'browser'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  content: string
  metadata: Record<string, unknown>
  read_at: string | null
  created_at: string
}

export interface NotificationPreferences {
  id: string
  user_id: string
  type: NotificationType
  channels: NotificationChannel[]
  enabled: boolean
  created_at: string
  updated_at: string
}

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

// Zod schemas for runtime validation
import { z } from 'zod'

export const notificationTypeSchema = z.enum([
  'new_message',
  'case_assigned',
  'case_updated',
  'emergency_alert',
  'handoff_request'
])

export const notificationPrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'urgent'
])

export const notificationChannelSchema = z.enum([
  'in_app',
  'email',
  'browser'
])

export const notificationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: notificationTypeSchema,
  priority: notificationPrioritySchema,
  title: z.string(),
  content: z.string(),
  metadata: z.record(z.unknown()),
  read_at: z.string().datetime().nullable(),
  created_at: z.string().datetime()
})

export const notificationPreferencesSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: notificationTypeSchema,
  channels: z.array(notificationChannelSchema),
  enabled: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const notificationMetadataSchema = z.object({
  case: z.object({
    id: z.string().uuid(),
    title: z.string(),
    status: z.string()
  }).optional(),
  message: z.object({
    id: z.string().uuid(),
    conversation_id: z.string().uuid(),
    preview: z.string()
  }).optional(),
  handoff: z.object({
    from_ai: z.boolean(),
    reason: z.string(),
    urgency: z.string()
  }).optional()
}) 