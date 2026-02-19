import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Clock } from 'lucide-react'
import type { Task } from '@shared/schemas'

interface UpcomingTasksProps {
  tasks: Task[]
  projectMap: Map<string, string>
}

function statusBadge(status: string): string {
  switch (status) {
    case 'Done':
      return 'bg-green-500/10 text-green-500'
    case 'In Progress':
      return 'bg-blue-500/10 text-blue-500'
    case 'Blocked':
      return 'bg-red-500/10 text-red-500'
    case 'Not Started':
      return 'bg-zinc-500/10 text-zinc-500'
    default:
      return 'bg-zinc-500/10 text-zinc-500'
  }
}

function priorityBadge(priority: string): string {
  switch (priority) {
    case 'Critical':
      return 'bg-red-500/10 text-red-500'
    case 'High':
      return 'bg-orange-500/10 text-orange-500'
    case 'Medium':
      return 'bg-yellow-500/10 text-yellow-500'
    case 'Low':
      return 'bg-zinc-500/10 text-zinc-500'
    default:
      return 'bg-zinc-500/10 text-zinc-500'
  }
}

function getDaysUntil(dateStr: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  const diffMs = target.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

function dueLabel(dueDate: string): string {
  const days = getDaysUntil(dueDate)
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  return `Due in ${days} days`
}

export function UpcomingTasks({ tasks, projectMap }: UpcomingTasksProps): JSX.Element {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const sevenDaysFromNow = new Date(now)
  sevenDaysFromNow.setDate(now.getDate() + 7)
  sevenDaysFromNow.setHours(23, 59, 59, 999)

  const upcomingTasks = tasks
    .filter((t) => {
      if (!t.due_date || t.status === 'Done') return false
      const dueDate = new Date(t.due_date)
      return dueDate >= now && dueDate <= sevenDaysFromNow
    })
    .sort((a, b) => a.due_date!.localeCompare(b.due_date!))

  const displayTasks = upcomingTasks.slice(0, 10)
  const hasMore = upcomingTasks.length > 10

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-blue-500" />
        <h2 className="text-lg font-semibold text-foreground">Upcoming</h2>
        {upcomingTasks.length > 0 && (
          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-500">
            {upcomingTasks.length}
          </span>
        )}
      </div>

      {displayTasks.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No tasks due in the next 7 days.
        </p>
      ) : (
        <div className="space-y-2">
          {displayTasks.map((task) => (
            <Link
              key={task.task_id}
              to={`/projects/${task.project_id}/tasks/${task.task_id}`}
              className="block rounded-md border border-border/50 p-3 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {projectMap.get(task.project_id) ?? 'Unknown'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      statusBadge(task.status),
                    )}
                  >
                    {task.status}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      priorityBadge(task.priority),
                    )}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
              <p className="mt-1 text-xs text-blue-500">
                {dueLabel(task.due_date!)}
                {' -- '}
                {new Date(task.due_date!).toLocaleDateString()}
              </p>
            </Link>
          ))}
          {hasMore && (
            <p className="pt-1 text-center text-xs text-muted-foreground">
              +{upcomingTasks.length - 10} more upcoming tasks
            </p>
          )}
        </div>
      )}
    </div>
  )
}
