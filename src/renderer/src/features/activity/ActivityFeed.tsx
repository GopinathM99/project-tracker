import { useState, useEffect } from 'react'
import { activityEventService } from '@/services/activity-event-service'
import type { ActivityEvent } from '@shared/schemas'
import { formatDistanceToNow } from 'date-fns'
import { User, Activity } from 'lucide-react'

interface ActivityFeedProps {
  workspaceId: string
  scope: 'entity' | 'project' | 'workspace'
  entityType?: string
  entityId?: string
  projectId?: string
}

const ACTION_BADGE_COLORS: Record<string, string> = {
  Created: 'bg-green-500/10 text-green-600',
  Updated: 'bg-blue-500/10 text-blue-600',
  Deleted: 'bg-red-500/10 text-red-600',
  Restored: 'bg-purple-500/10 text-purple-600',
  StatusChanged: 'bg-yellow-500/10 text-yellow-600',
  Assigned: 'bg-cyan-500/10 text-cyan-600',
  Commented: 'bg-indigo-500/10 text-indigo-600',
  Linked: 'bg-blue-500/10 text-blue-600',
  Unlinked: 'bg-blue-500/10 text-blue-600',
  Archived: 'bg-zinc-500/10 text-zinc-600',
  Unarchived: 'bg-zinc-500/10 text-zinc-600',
}

function formatTimestamp(isoString: string): string {
  try {
    return formatDistanceToNow(new Date(isoString), { addSuffix: true })
  } catch {
    return isoString
  }
}

export function ActivityFeed({
  workspaceId,
  scope,
  entityType,
  entityId,
  projectId,
}: ActivityFeedProps): JSX.Element {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentLimit, setCurrentLimit] = useState(50)

  useEffect(() => {
    if (!workspaceId) return

    let cancelled = false

    async function fetchEvents(): Promise<void> {
      try {
        let result: ActivityEvent[] = []

        if (scope === 'entity' && entityType && entityId) {
          result = await activityEventService.getEntityEvents(
            workspaceId,
            entityType,
            entityId,
            { limitCount: currentLimit },
          )
        } else if (scope === 'project' && projectId) {
          result = await activityEventService.getProjectEvents(
            workspaceId,
            projectId,
            { limitCount: currentLimit },
          )
        } else if (scope === 'workspace') {
          result = await activityEventService.getWorkspaceEvents(
            workspaceId,
            { limitCount: currentLimit },
          )
        }

        if (!cancelled) {
          setEvents(result)
        }
      } catch {
        // Silently handle errors - activity feed is non-critical
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    setLoading(true)
    void fetchEvents()

    return () => {
      cancelled = true
    }
  }, [workspaceId, scope, entityType, entityId, projectId, currentLimit])

  function handleLoadMore(): void {
    setCurrentLimit((prev) => prev + 50)
  }

  if (loading && events.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Activity className="h-4 w-4" />
          Activity
        </h2>
        <p className="text-sm text-muted-foreground">Loading activity...</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Activity className="h-4 w-4" />
        Activity
      </h2>

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity yet</p>
      ) : (
        <div className="space-y-0">
          {events.map((event, index) => (
            <div key={event.event_id} className="relative flex gap-3 pb-4">
              {/* Timeline line */}
              {index < events.length - 1 && (
                <div className="absolute left-[13px] top-8 h-[calc(100%-20px)] w-px bg-border" />
              )}

              {/* Actor icon */}
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-foreground">{event.change_summary}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${ACTION_BADGE_COLORS[event.action] ?? 'bg-zinc-500/10 text-zinc-600'}`}
                  >
                    {event.action}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatTimestamp(event.created_at)}
                </p>
              </div>
            </div>
          ))}

          {/* Load more button */}
          {events.length >= currentLimit && (
            <button
              onClick={handleLoadMore}
              className="mt-2 w-full rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  )
}
