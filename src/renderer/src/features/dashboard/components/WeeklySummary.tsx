import { CalendarDays } from 'lucide-react'
import type { Task } from '@shared/schemas'

interface WeeklySummaryProps {
  tasks: Task[]
}

function getWeekBounds(): { start: Date; end: Date } {
  const now = new Date()
  const day = now.getDay()
  // Monday = 1, Sunday = 0 -> shift so Monday is start of week
  const diffToMonday = day === 0 ? 6 : day - 1
  const start = new Date(now)
  start.setDate(now.getDate() - diffToMonday)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

function isOverdue(task: Task): boolean {
  if (!task.due_date || task.status === 'Done') return false
  return new Date(task.due_date) < new Date()
}

export function WeeklySummary({ tasks }: WeeklySummaryProps): JSX.Element {
  const { start, end } = getWeekBounds()

  // Tasks completed this week: status is Done AND updated_at falls within this week
  const completedThisWeek = tasks.filter((t) => {
    if (t.status !== 'Done') return false
    const updated = new Date(t.updated_at)
    return updated >= start && updated <= end
  }).length

  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length
  const blockedCount = tasks.filter((t) => t.status === 'Blocked').length
  const overdueCount = tasks.filter((t) => isOverdue(t)).length

  const maxValue = Math.max(completedThisWeek, inProgressCount, blockedCount, overdueCount, 1)

  const bars = [
    { label: 'Completed', value: completedThisWeek, color: 'bg-green-500' },
    { label: 'In Progress', value: inProgressCount, color: 'bg-blue-500' },
    { label: 'Blocked', value: blockedCount, color: 'bg-red-500' },
    { label: 'Overdue', value: overdueCount, color: 'bg-orange-500' },
  ]

  const weekLabel = `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">Weekly Summary</h2>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">{weekLabel}</p>

      <div className="space-y-3">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{bar.label}</span>
              <span className="font-medium text-foreground">{bar.value}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${bar.color} transition-all duration-300`}
                style={{ width: `${maxValue > 0 ? (bar.value / maxValue) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
