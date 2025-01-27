import { z } from 'zod'
import {
  notificationPriorityEnum,
  notificationTypeEnum
} from '@/lib/validations/shared-enums'

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

export type NotificationMetadata = z.infer<typeof notificationMetadataSchema>

export const notificationsRowSchema = z.object({
  content: z.string(),
  created_at: z.string().nullable(),
  id: z.string(),
  metadata: notificationMetadataSchema.nullable(),
  priority: notificationPriorityEnum,
  read_at: z.string().nullable(),
  title: z.string(),
  type: notificationTypeEnum,
  user_id: z.string(),
})

export type NotificationsRow = z.infer<typeof notificationsRowSchema>

export const notificationsInsertSchema = z.object({
  content: z.string(),
  created_at: z.string().nullable().optional(),
  id: z.string().optional(),
  metadata: notificationMetadataSchema.nullable().optional(),
  priority: notificationPriorityEnum.optional(),
  read_at: z.string().nullable().optional(),
  title: z.string(),
  type: notificationTypeEnum,
  user_id: z.string(),
})

export type NotificationsInsert = z.infer<typeof notificationsInsertSchema>

export const notificationsUpdateSchema = notificationsInsertSchema.partial()
export type NotificationsUpdate = z.infer<typeof notificationsUpdateSchema>