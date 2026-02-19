import { memo } from 'react'
import { Link } from 'react-router-dom'
import type { Task } from '@shared/schemas'
import { CircleDot, Flag, Calendar, User } from 'lucide-react'
import { cn } from '@/lib/cn'

interface TaskCardProps {
  task: Task
  projectId: string
  selected?: boolean
  onSelect?: () => void
}

function statusColor(status: string): string {
  switch (status) {
    case 'Not Started':
      return 'bg-zinc-500/10 text-zinc-500'
    case 'In Progress':
      return 'bg-blue-500/10 text-blue-500'
    case 'Blocked':
      return 'bg-red-500/10 text-red-500'
    case 'Done':
      return 'bg-green-500/10 text-green-500'
    default:
      return 'bg-zinc-500/10 text-zinc-500'
  }
}

function priorityColor(priority: string): string {
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

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString()
}

function isOverdue(task: Task): boolean {
  if (!task.due_date || task.status === 'Done') return false
  return new Date(task.due_date) < new Date()
}

export const TaskCard = memo(function TaskCard({ task, projectId, selected, onSelect }: TaskCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 transition-colors',
        selected && 'border-primary bg-primary/5',
      )}
    >
      {onSelect && (
        <input
          type="checkbox"
          checked={selected ?? false}
          onChange={(e) => {
            e.stopPropagation()
            onSelect()
          }}
          className="h-4 w-4 shrink-0 rounded border-input accent-primary cursor-pointer"
        />
      )}

      <Link
        to={`/projects/${projectId}/tasks/${task.task_id}`}
        className="flex flex-1 items-center gap-3 hover:opacity-80"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <h4 className="text-sm font-medium text-foreground truncate">{task.title}</h4>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(task.status)}`}
          >
            <CircleDot className="h-3 w-3" />
            {task.status}
          </span>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${priorityColor(task.priority)}`}
          >
            <Flag className="h-3 w-3" />
            {task.priority}
          </span>

          {task.due_date && (
            <span
              className={`inline-flex items-center gap-1 text-xs ${isOverdue(task) ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}
            >
              <Calendar className="h-3 w-3" />
              {formatDate(task.due_date)}
            </span>
          )}

          {task.owner && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              {task.owner}
            </span>
          )}
        </div>
      </Link>
    </div>
  )
})
