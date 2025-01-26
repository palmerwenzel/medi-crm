import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/providers/auth-provider'
import {
  type Notification,
  type NotificationType,
  type NotificationChannel
} from '@/types/notifications'
import {
  getNotifications,
  getNotificationPreferences,
  markAsRead,
  markAllAsRead,
  updateNotificationPreferences,
  subscribeToNotifications,
  requestNotificationPermission,
  showBrowserNotification
} from '@/lib/services/notification-service'

interface UseNotificationsOptions {
  unreadOnly?: boolean
  limit?: number
  type?: NotificationType
  onError?: (error: Error) => void
}

export function useNotifications({
  unreadOnly = false,
  limit = 20,
  type,
  onError
}: UseNotificationsOptions = {}) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)

  // Load initial notifications
  useEffect(() => {
    if (!user) return

    let mounted = true

    async function loadNotifications() {
      try {
        setIsLoading(true)
        const data = await getNotifications({ unreadOnly, limit, offset, type })
        if (mounted) {
          setNotifications(prev => [...prev, ...data])
          setHasMore(data.length === limit)
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load notifications')
        if (mounted) {
          setError(error)
          onError?.(error)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadNotifications()
    return () => { mounted = false }
  }, [user, unreadOnly, limit, offset, type, onError])

  // Subscribe to new notifications
  useEffect(() => {
    if (!user) return

    // Request browser notification permission
    requestNotificationPermission()

    // Subscribe to real-time updates
    const unsubscribe = subscribeToNotifications((notification) => {
      // Add new notification to state
      setNotifications(prev => [notification, ...prev])

      // Show browser notification if enabled
      if (notification.metadata.channels?.includes('browser')) {
        showBrowserNotification(notification.title, {
          body: notification.content,
          icon: '/notification-icon.png',
          tag: notification.id
        })
      }
    })

    return () => {
      unsubscribe()
    }
  }, [user])

  // Handle marking as read
  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      )
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to mark notification as read')
      setError(error)
      onError?.(error)
    }
  }, [onError])

  // Handle marking all as read
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead()
      setNotifications(prev => 
        prev.map(n => ({
          ...n,
          read_at: n.read_at || new Date().toISOString()
        }))
      )
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to mark all notifications as read')
      setError(error)
      onError?.(error)
    }
  }, [onError])

  // Load more notifications
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setOffset(prev => prev + limit)
    }
  }, [isLoading, hasMore, limit])

  return {
    notifications,
    isLoading,
    error,
    hasMore,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    loadMore
  }
} 