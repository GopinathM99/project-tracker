import { useState, useEffect } from 'react'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { useAuthStore } from '@/stores/authStore'
import { inAppNotificationService } from '@/services/in-app-notification-service'

interface UseUnreadNotificationsResult {
  unreadCount: number
  loading: boolean
}

export function useUnreadNotifications(): UseUnreadNotificationsResult {
  const workspaceId = useWorkspaceId()
  const user = useAuthStore((s) => s.user)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!workspaceId || !user?.uid) {
      setUnreadCount(0)
      setLoading(false)
      return
    }

    setLoading(true)

    const unsubscribe = inAppNotificationService.subscribeToUnreadCount(
      workspaceId,
      user.uid,
      (count) => {
        setUnreadCount(count)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [workspaceId, user?.uid])

  return { unreadCount, loading }
}
