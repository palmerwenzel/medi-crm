import { z } from 'zod'
import type { 
  DbNotificationPreference, 
  DbNotificationPreferenceInsert, 
  DbNotificationPreferenceUpdate 
} from '@/types/domain/db'
import { notificationChannelEnum, notificationTypeEnum } from '@/lib/validations/shared-enums'

export const notificationPreferencesRowSchema = z.object({
  channels: z.array(notificationChannelEnum),
  created_at: z.string(),
  enabled: z.boolean(),
  id: z.string(),
  type: notificationTypeEnum,
  updated_at: z.string(),
  user_id: z.string(),
}) satisfies z.ZodType<DbNotificationPreference>

export type NotificationPreferencesRow = z.infer<typeof notificationPreferencesRowSchema>

export const notificationPreferencesInsertSchema = z.object({
  channels: z.array(notificationChannelEnum).optional(),
  created_at: z.string().optional(),
  enabled: z.boolean(),
  id: z.string().optional(),
  type: notificationTypeEnum,
  updated_at: z.string().optional(),
  user_id: z.string(),
}) satisfies z.ZodType<DbNotificationPreferenceInsert>

export type NotificationPreferencesInsert = z.infer<typeof notificationPreferencesInsertSchema>

export const notificationPreferencesUpdateSchema = notificationPreferencesInsertSchema.partial() satisfies z.ZodType<DbNotificationPreferenceUpdate>

export type NotificationPreferencesUpdate = z.infer<typeof notificationPreferencesUpdateSchema>