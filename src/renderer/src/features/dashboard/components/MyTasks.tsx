import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/cn'
import { User } from 'lucide-react'
import type { Task } from '@shared/schemas'

interface MyTasksProps {
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

function formatDate(isoString: string | null): string {
  if (!isoString) return '--'
  return new Date(isoString).toLocaleDateString()
}

export function MyTasks({ tasks, projectMap }: MyTasksProps): JSX.Element {
  const user = useAuthStore((s) => s.user)

  const myTasks = tasks.filter((t) => {
    if (!user || !t.owner) return false
    return (
      t.owner === user.uid ||
      t.owner === user.email ||
      t.owner === user.displayName
    )
  })

  // Sort: non-done tasks first, then by priority (Critical > High > Medium > Low), then by due date
  const priorityWeight: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 }
  const sortedTasks = [...myTasks].sort((a, b) => {
    // Done tasks go to the bottom
    if (a.status === 'Done' && b.status !== 'Done') return 1
    if (a.status !== 'Done' && b.status === 'Done') return -1
    // Higher priority first
    const pa = priorityWeight[a.priority] ?? 0
    const pb = priorityWeight[b.priority] ?? 0
    if (pa !== pb) return pb - pa
    // Earlier due date first
    if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date)
    if (a.due_date) return -1
    if (b.due_date) return 1
    return 0
  })

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">My Tasks</h2>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {myTasks.length}
        </span>
      </div>

      {sortedTasks.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No tasks assigned to you across any project.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-3 font-medium">Task</th>
                <th className="pb-2 pr-3 font-medium">Project</th>
                <th className="pb-2 pr-3 font-medium">Status</th>
                <th className="pb-2 pr-3 font-medium">Priority</th>
                <th className="pb-2 font-medium">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks.map((task) => (
                <tr
                  key={task.task_id}
                  className="border-b border-border/50 last:border-b-0"
                >
                  <td className="py-2 pr-3">
                    <Link
                      to={`/projects/${task.project_id}/tasks/${task.task_id}`}
                      className="text-primary hover:underline"
                    >
                      {task.title}
                    </Link>
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">
                    <Link
                      to={`/projects/${task.project_id}`}
                      className="hover:underline"
                    >
                      {projectMap.get(task.project_id) ?? 'Unknown'}
                    </Link>
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        statusBadge(task.status),
                      )}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        priorityBadge(task.priority),
                      )}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-2 text-muted-foreground">
                    {formatDate(task.due_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
