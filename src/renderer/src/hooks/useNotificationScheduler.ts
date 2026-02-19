import { useEffect } from 'react'
import { useWorkspaceId } from './useWorkspace'
import { notificationService } from '@/services/notification-service'
import { badgeService } from '@/services/badge-service'
import { useNotificationPrefsStore } from '@/stores/notificationPrefsStore'

/**
 * Starts/stops the notification and badge services based on workspace availability
 * and user preferences. Should be called from AppShell or WorkspaceGuard.
 */
export function useNotificationScheduler(): void {
  const workspaceId = useWorkspaceId()
  const remindersEnabled = useNotificationPrefsStore((s) => s.remindersEnabled)
  const overdueEnabled = useNotificationPrefsStore((s) => s.overdueEnabled)

  useEffect(() => {
    if (!workspaceId) return

    // Start notification service if any notification type is enabled
    if (remindersEnabled || overdueEnabled) {
      notificationService.start(workspaceId)
    }

    // Always start badge service when workspace is available
    badgeService.start(workspaceId)

    return () => {
      notificationService.stop()
      badgeService.stop()
    }
  }, [workspaceId, remindersEnabled, overdueEnabled])
}
