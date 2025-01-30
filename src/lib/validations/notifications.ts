import { z } from 'zod'
import type { 
  Notification,
  NotificationInsert,
  NotificationUpdate,
  NotificationMetadata
} from '@/types/domain/notifications'
import {
  notificationPriorityEnum,
  notificationTypeEnum
} from '@/lib/validations/shared-enums'
import { rawToUserIdSchema } from './shared-schemas'

// Notification metadata schema
export const notificationMetadataSchema = z.object({
  case: z.object({
    id: z.string(),
    title: z.string(),
    status: z.string()
  }).optional(),
  message: z.object({
    id: z.string(),
    conversation_id: z.string(),
    preview: z.string()
  }).optional(),
  handoff: z.object({
    from_ai: z.boolean(),
    reason: z.string(),
    urgency: z.string()
  }).optional()
}) satisfies z.ZodType<NotificationMetadata>

// Base notification schema (for database -> domain)
export const notificationsRowSchema = z.object({
  id: z.string(),
  user_id: rawToUserIdSchema,
  type: notificationTypeEnum,
  title: z.string(),
  content: z.string(),
  priority: notificationPriorityEnum,
  metadata: notificationMetadataSchema,
  read_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
}) satisfies z.ZodType<Notification>

export type NotificationsRow = z.infer<typeof notificationsRowSchema>

// Insert schema (for domain -> database)
export const notificationsInsertSchema = z.object({
  user_id: rawToUserIdSchema,
  type: notificationTypeEnum,
  title: z.string(),
  body: z.string(),
  priority: notificationPriorityEnum.optional(),
  metadata: notificationMetadataSchema.optional(),
  read_at: z.string().nullable().optional(),
  id: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
}) satisfies z.ZodType<NotificationInsert>

export type NotificationsInsert = z.infer<typeof notificationsInsertSchema>

// Update schema
export const notificationsUpdateSchema = notificationsInsertSchema.partial() satisfies z.ZodType<NotificationUpdate>
export type NotificationsUpdate = z.infer<typeof notificationsUpdateSchema>

// Query parameter schemas
export const notificationsQuerySchema = z.object({
  user_id: rawToUserIdSchema,
  type: notificationTypeEnum.optional(),
  read: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(20)
})