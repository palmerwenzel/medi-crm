import { createClient } from '@/utils/supabase/client'
import { 
  type NotificationType,
  type NotificationPriority,
  type NotificationChannel,
  type Notification,
  type NotificationPreferences
} from '@/types/notifications'

const supabase = createClient()

/**
 * Get user's notifications with optional filtering
 */
export async function getNotifications(
  options: {
    unreadOnly?: boolean
    limit?: number
    offset?: number
    type?: NotificationType
  } = {}
) {
  const { unreadOnly = false, limit = 20, offset = 0, type } = options

  let query = supabase
    .from('notifications')
    .select()
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (unreadOnly) {
    query = query.is('read_at', null)
  }

  if (type) {
    query = query.eq('type', type)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)

  if (error) throw error
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead() {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .is('read_at', null)

  if (error) throw error
}

/**
 * Get user's notification preferences
 */
export async function getNotificationPreferences() {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select()

  if (error) throw error
  return data
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  type: NotificationType,
  updates: {
    enabled?: boolean
    channels?: NotificationChannel[]
  }
) {
  const { error } = await supabase
    .from('notification_preferences')
    .upsert({
      type,
      ...updates,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,type'
    })

  if (error) throw error
}

/**
 * Subscribe to real-time notifications
 */
export function subscribeToNotifications(
  onNotification: (notification: Notification) => void
) {
  const channel = supabase
    .channel('new_notification')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      },
      (payload) => {
        onNotification(payload.new as Notification)
      }
    )
    .subscribe()

  return () => {
    channel.unsubscribe()
  }
}

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

/**
 * Show browser notification
 */
export function showBrowserNotification(
  title: string,
  options?: NotificationOptions
) {
  if (Notification.permission === 'granted') {
    return new Notification(title, options)
  }
  return null
} 