import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { AlertTriangle } from 'lucide-react'
import type { Task } from '@shared/schemas'

interface OverdueTasksProps {
  tasks: Task[]
  projectMap: Map<string, string>
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

function getDaysOverdue(dueDate: string): number {
  const now = new Date()
  const due = new Date(dueDate)
  const diffMs = now.getTime() - due.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

export function OverdueTasks({ tasks, projectMap }: OverdueTasksProps): JSX.Element {
  const now = new Date()

  const overdueTasks = tasks
    .filter((t) => {
      if (!t.due_date || t.status === 'Done') return false
      return new Date(t.due_date) < now
    })
    .sort((a, b) => {
      // Most overdue first (earliest due date first)
      return a.due_date!.localeCompare(b.due_date!)
    })

  const displayTasks = overdueTasks.slice(0, 10)
  const hasMore = overdueTasks.length > 10

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        <h2 className="text-lg font-semibold text-foreground">Overdue</h2>
        {overdueTasks.length > 0 && (
          <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-500">
            {overdueTasks.length}
          </span>
        )}
      </div>

      {displayTasks.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No overdue tasks. Great work!
        </p>
      ) : (
        <div className="space-y-2">
          {displayTasks.map((task) => {
            const daysOverdue = getDaysOverdue(task.due_date!)
            return (
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
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                      priorityBadge(task.priority),
                    )}
                  >
                    {task.priority}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs">
                  <span className="font-medium text-red-500">
                    Due {new Date(task.due_date!).toLocaleDateString()}
                  </span>
                  <span className="text-orange-500">
                    {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue
                  </span>
                </div>
              </Link>
            )
          })}
          {hasMore && (
            <p className="pt-1 text-center text-xs text-muted-foreground">
              +{overdueTasks.length - 10} more overdue tasks
            </p>
          )}
        </div>
      )}
    </div>
  )
}
