import { z } from 'zod'
import { notificationChannelEnum } from '@/lib/validations/shared-enums'

export const notificationPreferencesRowSchema = z.object({
  channels: z.array(notificationChannelEnum),
  created_at: z.string().nullable(),
  enabled: z.boolean(),
  id: z.string(),
  type: z.string(), 
  updated_at: z.string().nullable(),
  user_id: z.string(),
})

export type NotificationPreferencesRow = z.infer<
  typeof notificationPreferencesRowSchema
>

export const notificationPreferencesInsertSchema = z.object({
  channels: z.array(notificationChannelEnum).optional(),
  created_at: z.string().nullable().optional(),
  enabled: z.boolean().optional(),
  id: z.string().optional(),
  type: z.string(), 
  updated_at: z.string().nullable().optional(),
  user_id: z.string(),
})

export type NotificationPreferencesInsert = z.infer<
  typeof notificationPreferencesInsertSchema
>

export const notificationPreferencesUpdateSchema =
  notificationPreferencesInsertSchema.partial()

export type NotificationPreferencesUpdate = z.infer<
  typeof notificationPreferencesUpdateSchema
>