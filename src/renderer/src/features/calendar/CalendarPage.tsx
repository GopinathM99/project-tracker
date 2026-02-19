import { useMemo, useEffect } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  parseISO,
  isWithinInterval,
  isBefore,
  startOfToday,
} from 'date-fns'
import { useDashboard } from '@/hooks/useDashboard'
import { useCalendarStore } from '@/stores/calendarStore'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { CalendarFilters } from './components/CalendarFilters'
import { MonthView } from './components/MonthView'
import { WeekView } from './components/WeekView'
import { DayView } from './components/DayView'
import { cn } from '@/lib/cn'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Task, Bug } from '@shared/schemas'

/** Unified calendar item used across all views. */
export interface CalendarItem {
  id: string
  projectId: string
  projectName: string
  title: string
  description: string
  status: string
  priority: string
  owner: string | null
  date: string // ISO string
  type: 'task' | 'bug'
  isOverdue: boolean
}

type ViewMode = 'month' | 'week' | 'day'

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: 'month', label: 'Month' },
  { value: 'week', label: 'Week' },
  { value: 'day', label: 'Day' },
]

function taskToCalendarItem(
  task: Task,
  projectName: string,
  today: Date
): CalendarItem | null {
  if (!task.due_date) return null
  const dueDate = parseISO(task.due_date)
  const isOverdue = task.status !== 'Done' && isBefore(dueDate, today)

  return {
    id: task.task_id,
    projectId: task.project_id,
    projectName,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    owner: task.owner,
    date: task.due_date,
    type: 'task',
    isOverdue,
  }
}

function bugToCalendarItem(
  bug: Bug,
  projectName: string,
  today: Date
): CalendarItem | null {
  if (!bug.target_fix_date) return null
  const targetDate = parseISO(bug.target_fix_date)
  const terminalStatuses = ['Fixed', 'Verified', 'Closed']
  const isOverdue = !terminalStatuses.includes(bug.status) && isBefore(targetDate, today)

  return {
    id: bug.bug_id,
    projectId: bug.project_id,
    projectName,
    title: bug.title,
    description: bug.description,
    status: bug.status,
    priority: bug.priority,
    owner: bug.assignee,
    date: bug.target_fix_date,
    type: 'bug',
    isOverdue,
  }
}

function getDateRange(
  viewMode: ViewMode,
  currentDate: Date
): { start: Date; end: Date } {
  switch (viewMode) {
    case 'month': {
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)
      return {
        start: startOfWeek(monthStart),
        end: endOfWeek(monthEnd),
      }
    }
    case 'week':
      return {
        start: startOfWeek(currentDate),
        end: endOfWeek(currentDate),
      }
    case 'day':
      return {
        start: startOfDay(currentDate),
        end: endOfDay(currentDate),
      }
  }
}

function getPeriodLabel(viewMode: ViewMode, currentDate: Date): string {
  switch (viewMode) {
    case 'month':
      return format(currentDate, 'MMMM yyyy')
    case 'week': {
      const weekStart = startOfWeek(currentDate)
      const weekEnd = endOfWeek(currentDate)
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
    }
    case 'day':
      return format(currentDate, 'EEEE, MMMM d, yyyy')
  }
}

export default function CalendarPage(): JSX.Element {
  const { projects, allTasks, allBugs, loading } = useDashboard()

  const viewMode = useCalendarStore((s) => s.viewMode)
  const setViewMode = useCalendarStore((s) => s.setViewMode)
  const currentDate = useCalendarStore((s) => s.currentDate)
  const goToToday = useCalendarStore((s) => s.goToToday)
  const goNext = useCalendarStore((s) => s.goNext)
  const goPrev = useCalendarStore((s) => s.goPrev)
  const projectFilter = useCalendarStore((s) => s.projectFilter)
  const statusFilter = useCalendarStore((s) => s.statusFilter)
  const ownerFilter = useCalendarStore((s) => s.ownerFilter)
  const clearFilters = useCalendarStore((s) => s.clearFilters)

  // Clear filters on unmount
  useEffect(() => {
    return () => {
      clearFilters()
    }
  }, [clearFilters])

  // Build project name map
  const projectNameMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const p of projects) {
      map[p.project_id] = p.name
    }
    return map
  }, [projects])

  // Convert tasks + bugs to CalendarItems with all filtering applied
  const calendarItems = useMemo(() => {
    const today = startOfToday()
    const range = getDateRange(viewMode, currentDate)
    const items: CalendarItem[] = []

    // Convert tasks
    for (const task of allTasks) {
      const item = taskToCalendarItem(task, projectNameMap[task.project_id] ?? 'Unknown', today)
      if (!item) continue

      // Date range filter - only include items within the visible range
      const itemDate = parseISO(item.date)
      if (!isWithinInterval(itemDate, { start: range.start, end: range.end })) continue

      // Project filter
      if (projectFilter && item.projectId !== projectFilter) continue

      // Status filter
      if (statusFilter.length > 0) {
        // For overdue items, check if "Overdue" is conceptually matching any selected status
        const matchesStatus = statusFilter.includes(item.status)
        if (!matchesStatus) continue
      }

      // Owner filter
      if (ownerFilter) {
        const ownerTerm = ownerFilter.toLowerCase()
        if (!item.owner?.toLowerCase().includes(ownerTerm)) continue
      }

      items.push(item)
    }

    // Convert bugs
    for (const bug of allBugs) {
      const item = bugToCalendarItem(bug, projectNameMap[bug.project_id] ?? 'Unknown', today)
      if (!item) continue

      const itemDate = parseISO(item.date)
      if (!isWithinInterval(itemDate, { start: range.start, end: range.end })) continue

      if (projectFilter && item.projectId !== projectFilter) continue

      if (statusFilter.length > 0) {
        // For bugs, map bug statuses to the task status filter:
        // Not Started = New, Triaged; In Progress = In Progress, Reopened;
        // Done = Fixed, Verified, Closed; Blocked is not applicable to bugs
        const bugStatusMap: Record<string, string> = {
          New: 'Not Started',
          Triaged: 'Not Started',
          'In Progress': 'In Progress',
          Reopened: 'In Progress',
          Fixed: 'Done',
          Verified: 'Done',
          Closed: 'Done',
        }
        const mappedStatus = bugStatusMap[item.status] ?? item.status
        if (!statusFilter.includes(mappedStatus)) continue
      }

      if (ownerFilter) {
        const ownerTerm = ownerFilter.toLowerCase()
        if (!item.owner?.toLowerCase().includes(ownerTerm)) continue
      }

      items.push(item)
    }

    // Sort by date, then by type (tasks first), then by priority
    const priorityOrder: Record<string, number> = {
      Critical: 0,
      High: 1,
      Medium: 2,
      Low: 3,
    }
    items.sort((a, b) => {
      const dateComp = a.date.localeCompare(b.date)
      if (dateComp !== 0) return dateComp
      if (a.type !== b.type) return a.type === 'task' ? -1 : 1
      return (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3)
    })

    return items
  }, [
    allTasks,
    allBugs,
    projectNameMap,
    viewMode,
    currentDate,
    projectFilter,
    statusFilter,
    ownerFilter,
  ])

  if (loading) {
    return <LoadingState />
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        title="No active projects"
        description="Create a project with tasks to see them on the calendar."
      />
    )
  }

  const periodLabel = getPeriodLabel(viewMode, currentDate)

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold text-foreground">Calendar</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex rounded-lg border border-border">
            {VIEW_MODES.map((mode) => (
              <button
                key={mode.value}
                onClick={() => setViewMode(mode.value)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium transition-colors',
                  'first:rounded-l-lg last:rounded-r-lg',
                  viewMode === mode.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={goPrev}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goToToday}
              className="rounded-md px-2.5 py-1 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Today
            </button>
            <button
              onClick={goNext}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Period label */}
          <span className="min-w-[180px] text-sm font-medium text-foreground">
            {periodLabel}
          </span>
        </div>
      </div>

      {/* Filters */}
      <CalendarFilters projects={projects} />

      {/* Calendar view */}
      {viewMode === 'month' && <MonthView items={calendarItems} />}
      {viewMode === 'week' && <WeekView items={calendarItems} />}
      {viewMode === 'day' && <DayView items={calendarItems} />}
    </div>
  )
}
