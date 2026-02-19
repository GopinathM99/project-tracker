import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
} from 'date-fns'
import { cn } from '@/lib/cn'
import { useCalendarStore } from '@/stores/calendarStore'
import { CheckCircle2, Bug as BugIcon } from 'lucide-react'
import type { CalendarItem } from '../CalendarPage'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MAX_VISIBLE_ITEMS = 3

function getItemBorderColor(item: CalendarItem): string {
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

function getItemTextColor(item: CalendarItem): string {
  if (item.isOverdue) return 'text-orange-600 dark:text-orange-400'
  if (item.type === 'bug') return 'text-violet-600 dark:text-violet-400'

  switch (item.status) {
    case 'Not Started':
      return 'text-zinc-600 dark:text-zinc-400'
    case 'In Progress':
      return 'text-blue-600 dark:text-blue-400'
    case 'Blocked':
      return 'text-red-600 dark:text-red-400'
    case 'Done':
      return 'text-green-600 dark:text-green-400'
    default:
      return 'text-zinc-600 dark:text-zinc-400'
  }
}

interface MonthViewProps {
  items: CalendarItem[]
}

export function MonthView({ items }: MonthViewProps): JSX.Element {
  const navigate = useNavigate()
  const currentDate = useCalendarStore((s) => s.currentDate)
  const setCurrentDate = useCalendarStore((s) => s.setCurrentDate)
  const setViewMode = useCalendarStore((s) => s.setViewMode)

  // Build the grid of days including padding days from adjacent months
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const gridStart = startOfWeek(monthStart)
    const gridEnd = endOfWeek(monthEnd)
    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [currentDate])

  // Group items by date string for fast lookup
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

  function handleDayClick(day: Date): void {
    setCurrentDate(day)
    setViewMode('day')
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Day name headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="px-2 py-1.5 text-center text-xs font-medium text-muted-foreground"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Day cells grid */}
      <div className="grid flex-1 auto-rows-fr grid-cols-7 overflow-y-auto">
        {calendarDays.map((day) => {
          const dayKey = day.toDateString()
          const dayItems = itemsByDate.get(dayKey) ?? []
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isTodayDate = isToday(day)
          const overflowCount = Math.max(0, dayItems.length - MAX_VISIBLE_ITEMS)
          const visibleItems = dayItems.slice(0, MAX_VISIBLE_ITEMS)

          return (
            <div
              key={dayKey}
              className={cn(
                'min-h-[100px] border-b border-r border-border p-1',
                !isCurrentMonth && 'bg-muted/30'
              )}
            >
              {/* Date number */}
              <button
                onClick={() => handleDayClick(day)}
                className={cn(
                  'mb-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs',
                  isTodayDate
                    ? 'bg-primary font-bold text-primary-foreground'
                    : isCurrentMonth
                      ? 'text-foreground hover:bg-accent'
                      : 'text-muted-foreground/50 hover:bg-accent/50'
                )}
              >
                {day.getDate()}
              </button>

              {/* Task/Bug chips */}
              <div className="flex flex-col gap-0.5">
                {visibleItems.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleItemClick(item)
                    }}
                    className={cn(
                      'flex w-full items-center gap-1 truncate rounded border-l-2 px-1 py-0.5 text-left text-[11px] leading-tight transition-colors hover:bg-accent',
                      getItemBorderColor(item)
                    )}
                    title={`${item.title} (${item.status})`}
                  >
                    {item.type === 'bug' ? (
                      <BugIcon className="h-3 w-3 flex-shrink-0 text-violet-500" />
                    ) : (
                      <CheckCircle2
                        className={cn('h-3 w-3 flex-shrink-0', getItemTextColor(item))}
                      />
                    )}
                    <span className="truncate">{item.title}</span>
                  </button>
                ))}

                {overflowCount > 0 && (
                  <button
                    onClick={() => handleDayClick(day)}
                    className="px-1 text-left text-[11px] font-medium text-muted-foreground hover:text-foreground"
                  >
                    +{overflowCount} more
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
