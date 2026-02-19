import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { isSameDay, parseISO } from 'date-fns'
import { cn } from '@/lib/cn'
import { useCalendarStore } from '@/stores/calendarStore'
import { CheckCircle2, Bug as BugIcon, Flag, User, FolderOpen } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import type { CalendarItem } from '../CalendarPage'

function getStatusBadge(item: CalendarItem): { bg: string; text: string; label: string } {
  if (item.isOverdue) {
    return { bg: 'bg-orange-500/10', text: 'text-orange-500', label: 'Overdue' }
  }
  if (item.type === 'bug') {
    const bugStatusMap: Record<string, { bg: string; text: string }> = {
      New: { bg: 'bg-zinc-500/10', text: 'text-zinc-500' },
      Triaged: { bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
      'In Progress': { bg: 'bg-blue-500/10', text: 'text-blue-500' },
      Fixed: { bg: 'bg-green-500/10', text: 'text-green-500' },
      Verified: { bg: 'bg-green-500/10', text: 'text-green-500' },
      Closed: { bg: 'bg-green-500/10', text: 'text-green-500' },
      Reopened: { bg: 'bg-red-500/10', text: 'text-red-500' },
    }
    const colors = bugStatusMap[item.status] ?? {
      bg: 'bg-zinc-500/10',
      text: 'text-zinc-500',
    }
    return { ...colors, label: item.status }
  }

  switch (item.status) {
    case 'Not Started':
      return { bg: 'bg-zinc-500/10', text: 'text-zinc-500', label: 'Not Started' }
    case 'In Progress':
      return { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'In Progress' }
    case 'Blocked':
      return { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Blocked' }
    case 'Done':
      return { bg: 'bg-green-500/10', text: 'text-green-500', label: 'Done' }
    default:
      return { bg: 'bg-zinc-500/10', text: 'text-zinc-500', label: item.status }
  }
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'Low':
      return 'bg-zinc-500/10 text-zinc-500'
    case 'Medium':
      return 'bg-yellow-500/10 text-yellow-500'
    case 'High':
      return 'bg-orange-500/10 text-orange-500'
    case 'Critical':
      return 'bg-red-500/10 text-red-500'
    default:
      return 'bg-zinc-500/10 text-zinc-500'
  }
}

function getCardBorderColor(item: CalendarItem): string {
  if (item.isOverdue) return 'border-l-orange-500'
  if (item.type === 'bug') return 'border-l-violet-500'

  switch (item.status) {
    case 'Not Started':
      return 'border-l-zinc-500'
    case 'In Progress':
      return 'border-l-blue-500'
    case 'Blocked':
      return 'border-l-red-500'
    case 'Done':
      return 'border-l-green-500'
    default:
      return 'border-l-zinc-500'
  }
}

interface DayViewProps {
  items: CalendarItem[]
}

export function DayView({ items }: DayViewProps): JSX.Element {
  const navigate = useNavigate()
  const currentDate = useCalendarStore((s) => s.currentDate)

  const dayItems = useMemo(() => {
    return items.filter((item) => isSameDay(parseISO(item.date), currentDate))
  }, [items, currentDate])

  function handleItemClick(item: CalendarItem): void {
    if (item.type === 'task') {
      navigate(`/projects/${item.projectId}/tasks/${item.id}`)
    } else {
      navigate(`/projects/${item.projectId}/bugs/${item.id}`)
    }
  }

  if (dayItems.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          title="No items for this day"
          description="There are no tasks or bugs scheduled for this date."
        />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto pb-4">
      <p className="text-sm text-muted-foreground">
        {dayItems.length} {dayItems.length === 1 ? 'item' : 'items'} scheduled
      </p>

      {dayItems.map((item) => {
        const badge = getStatusBadge(item)
        return (
          <button
            key={`${item.type}-${item.id}`}
            onClick={() => handleItemClick(item)}
            className={cn(
              'flex flex-col gap-2 rounded-lg border border-border border-l-4 bg-card p-4 text-left shadow-sm transition-colors hover:border-primary/50',
              getCardBorderColor(item)
            )}
          >
            {/* Title row */}
            <div className="flex items-start gap-2">
              {item.type === 'bug' ? (
                <BugIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-500" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                {item.description && (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {item.description.length > 100
                      ? `${item.description.slice(0, 100)}...`
                      : item.description}
                  </p>
                )}
              </div>
            </div>

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status badge */}
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  badge.bg,
                  badge.text
                )}
              >
                {badge.label}
              </span>

              {/* Priority badge */}
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                  getPriorityColor(item.priority)
                )}
              >
                <Flag className="h-3 w-3" />
                {item.priority}
              </span>

              {/* Owner */}
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                {item.owner ?? 'Unassigned'}
              </span>

              {/* Project name */}
              {item.projectName && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <FolderOpen className="h-3 w-3" />
                  {item.projectName}
                </span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
