import { z } from 'zod'
import type { 
  NotificationPreference,
  NotificationPreferenceInsert,
  NotificationPreferenceUpdate
} from '@/types/domain/notifications'
import { notificationChannelEnum, notificationTypeEnum } from '@/lib/validations/shared-enums'
import { rawToUserIdSchema } from './shared-schemas'

// Base notification preference schema (for database -> domain)
export const notificationPreferencesRowSchema = z.object({
  id: z.string(),
  user_id: rawToUserIdSchema,
  type: notificationTypeEnum,
  channels: z.array(notificationChannelEnum),
  enabled: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
}) satisfies z.ZodType<NotificationPreference>

export type NotificationPreferencesRow = z.infer<typeof notificationPreferencesRowSchema>

// Insert schema (for domain -> database)
export const notificationPreferencesInsertSchema = z.object({
  user_id: rawToUserIdSchema,
  type: notificationTypeEnum,
  channels: z.array(notificationChannelEnum),
  enabled: z.boolean().optional(),
  id: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
}) satisfies z.ZodType<NotificationPreferenceInsert>

export type NotificationPreferencesInsert = z.infer<typeof notificationPreferencesInsertSchema>

// Update schema
export const notificationPreferencesUpdateSchema = notificationPreferencesInsertSchema.partial() satisfies z.ZodType<NotificationPreferenceUpdate>
export type NotificationPreferencesUpdate = z.infer<typeof notificationPreferencesUpdateSchema>

// Query parameter schemas
export const notificationPreferencesQuerySchema = z.object({
  user_id: rawToUserIdSchema,
  type: notificationTypeEnum.optional()
})