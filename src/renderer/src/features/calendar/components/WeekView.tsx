import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  format,
  parseISO,
} from 'date-fns'
import { cn } from '@/lib/cn'
import { useCalendarStore } from '@/stores/calendarStore'
import { CheckCircle2, Bug as BugIcon, Flag, User } from 'lucide-react'
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

interface WeekViewProps {
  items: CalendarItem[]
}

export function WeekView({ items }: WeekViewProps): JSX.Element {
  const navigate = useNavigate()
  const currentDate = useCalendarStore((s) => s.currentDate)

  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate)
    const weekEnd = endOfWeek(currentDate)
    return eachDayOfInterval({ start: weekStart, end: weekEnd })
  }, [currentDate])

  const itemsByDate = useMemo(() => {
    const map = new Map<string, CalendarItem[]>()
    for (const item of items) {
      const dateKey = parseISO(item.date).toDateString()
      const existing = map.get(dateKey)
      if (existing) {
        existing.push(item)
      } else {
        map.set(dateKey, [item])
      }
    }
    return map
  }, [items])

  function handleItemClick(item: CalendarItem): void {
    if (item.type === 'task') {
      navigate(`/projects/${item.projectId}/tasks/${item.id}`)
    } else {
      navigate(`/projects/${item.projectId}/bugs/${item.id}`)
    }
  }

  return (
    <div className="flex flex-1 gap-2 overflow-x-auto overflow-y-hidden pb-2">
      {weekDays.map((day) => {
        const dayKey = day.toDateString()
        const dayItems = itemsByDate.get(dayKey) ?? []
        const isTodayDate = isToday(day)

        return (
          <div
            key={dayKey}
            className={cn(
              'flex min-w-[180px] flex-1 flex-col rounded-lg border border-border',
              isTodayDate && 'border-primary/50'
            )}
          >
            {/* Day header */}
            <div
              className={cn(
                'border-b border-border px-3 py-2 text-center',
                isTodayDate && 'bg-primary/5'
              )}
            >
              <div className="text-xs font-medium text-muted-foreground">
                {format(day, 'EEE')}
              </div>
              <div
                className={cn(
                  'mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold',
                  isTodayDate
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground'
                )}
              >
                {format(day, 'd')}
              </div>
            </div>

            {/* Task/Bug cards */}
            <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto p-2">
              {dayItems.length === 0 && (
                <p className="py-4 text-center text-xs text-muted-foreground/50">No items</p>
              )}
              {dayItems.map((item) => {
                const badge = getStatusBadge(item)
                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      'flex flex-col gap-1 rounded-md border border-border border-l-2 bg-card p-2 text-left shadow-sm transition-colors hover:border-primary/50',
                      getCardBorderColor(item)
                    )}
                  >
                    {/* Title with icon */}
                    <div className="flex items-start gap-1.5">
                      {item.type === 'bug' ? (
                        <BugIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-violet-500" />
                      ) : (
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium leading-tight text-foreground">
                        {item.title}
                      </span>
                    </div>

                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-1">
                      {/* Status badge */}
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                          badge.bg,
                          badge.text
                        )}
                      >
                        {badge.label}
                      </span>

                      {/* Priority */}
                      <span
                        className={cn(
                          'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                          getPriorityColor(item.priority)
                        )}
                      >
                        <Flag className="h-2.5 w-2.5" />
                        {item.priority}
                      </span>
                    </div>

                    {/* Owner + Project */}
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-0.5">
                        <User className="h-2.5 w-2.5" />
                        {item.owner ?? 'Unassigned'}
                      </span>
                      {item.projectName && (
                        <span className="truncate">{item.projectName}</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
