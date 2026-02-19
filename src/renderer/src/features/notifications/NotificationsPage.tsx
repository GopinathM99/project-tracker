import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { useAuthStore } from '@/stores/authStore'
import { inAppNotificationService } from '@/services/in-app-notification-service'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Notification as AppNotification } from '@shared/schemas'
import { formatDistanceToNow } from 'date-fns'
import {
  Bell,
  UserPlus,
  MessageSquare,
  ArrowRightLeft,
  Flag,
  Mail,
  CheckCheck,
} from 'lucide-react'

type FilterTab = 'all' | 'unread'

function getTriggerIcon(triggerType: AppNotification['trigger_type']): JSX.Element {
  const iconClass = 'h-4 w-4'
  switch (triggerType) {
    case 'Assignment':
      return <UserPlus className={iconClass} />
    case 'Comment':
      return <MessageSquare className={iconClass} />
    case 'StatusChange':
      return <ArrowRightLeft className={iconClass} />
    case 'PriorityChange':
      return <Flag className={iconClass} />
    case 'Reminder':
    case 'Overdue':
      return <Bell className={iconClass} />
    case 'Invite':
      return <Mail className={iconClass} />
    default:
      return <Bell className={iconClass} />
  }
}

function formatTimestamp(isoString: string): string {
  try {
    return formatDistanceToNow(new Date(isoString), { addSuffix: true })
  } catch {
    return isoString
  }
}

export default function NotificationsPage(): JSX.Element {
  const navigate = useNavigate()
  const workspaceId = useWorkspaceId()
  const user = useAuthStore((s) => s.user)

  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [unreadCount, setUnreadCount] = useState(0)

  // Subscribe to notifications
  useEffect(() => {
    if (!workspaceId || !user?.uid) {
      setNotifications([])
      setLoading(false)
      return
    }

    setLoading(true)

    const unsubscribe = inAppNotificationService.subscribeToUserNotifications(
      workspaceId,
      user.uid,
      (notifs) => {
        setNotifications(notifs)
        setLoading(false)
      },
      { unreadOnly: activeTab === 'unread' },
    )

    return unsubscribe
  }, [workspaceId, user?.uid, activeTab])

  // Subscribe to unread count
  useEffect(() => {
    if (!workspaceId || !user?.uid) {
      setUnreadCount(0)
      return
    }

    const unsubscribe = inAppNotificationService.subscribeToUnreadCount(
      workspaceId,
      user.uid,
      setUnreadCount,
    )

    return unsubscribe
  }, [workspaceId, user?.uid])

  async function handleMarkAllAsRead(): Promise<void> {
    if (!workspaceId || !user?.uid) return
    try {
      await inAppNotificationService.markAllAsRead(workspaceId, user.uid)
    } catch {
      // Silently handle
    }
  }

  async function handleNotificationClick(notification: AppNotification): Promise<void> {
    if (!workspaceId) return

    // Mark as read
    if (!notification.is_read) {
      try {
        await inAppNotificationService.markAsRead(workspaceId, notification.notification_id)
      } catch {
        // Silently handle
      }
    }

    // Navigate to deep link based on entity type
    navigateToEntity(notification)
  }

  function navigateToEntity(notification: AppNotification): void {
    switch (notification.entity_type) {
      case 'Project':
        navigate(`/projects/${notification.entity_id}`)
        break
      case 'Task':
      case 'Bug':
      case 'Milestone':
      case 'Comment':
        // For these, navigate to the projects page since we don't have the project_id
        // in the notification schema. The user can find the entity from there.
        navigate(`/projects`)
        break
      case 'Workspace':
        navigate(`/settings`)
        break
      default:
        break
    }
  }

  if (loading && notifications.length === 0) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-6 flex items-center gap-3">
          <Bell className="h-5 w-5 text-foreground" />
          <h1 className="text-xl font-bold text-foreground">Notifications</h1>
        </div>
        <p className="text-sm text-muted-foreground">Loading notifications...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-foreground" />
          <h1 className="text-xl font-bold text-foreground">Notifications</h1>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-medium text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <CheckCheck className="h-4 w-4" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-1 rounded-lg bg-muted p-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('unread')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            activeTab === 'unread'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Unread
        </button>
      </div>

      {/* Notification list */}
      {notifications.length === 0 ? (
        <EmptyState
          title={activeTab === 'unread' ? 'All Caught Up' : 'No Notifications'}
          description={
            activeTab === 'unread'
              ? 'You have no unread notifications.'
              : 'Your notification inbox will appear here.'
          }
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <button
              key={notification.notification_id}
              onClick={() => handleNotificationClick(notification)}
              className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent/50 ${
                notification.is_read
                  ? 'border-border bg-card'
                  : 'border-primary/20 bg-primary/5'
              }`}
            >
              {/* Icon */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                {getTriggerIcon(notification.trigger_type)}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm ${
                    notification.is_read
                      ? 'text-foreground'
                      : 'font-semibold text-foreground'
                  }`}
                >
                  {notification.title}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">{notification.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatTimestamp(notification.created_at)}
                </p>
              </div>

              {/* Unread indicator */}
              {!notification.is_read && (
                <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
