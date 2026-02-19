import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Flag, Calendar, User } from 'lucide-react'
import type { Task } from '@shared/schemas'

interface KanbanCardProps {
  task: Task
  canDrag: boolean
  showProjectName?: boolean
  projectName?: string
  onDragOverCard?: (taskId: string, position: 'above' | 'below') => void
  onDragLeaveCard?: () => void
  dropIndicator?: 'above' | 'below' | null
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

export const KanbanCard = memo(function KanbanCard({
  task,
  canDrag,
  showProjectName,
  projectName,
  onDragOverCard,
  onDragLeaveCard,
  dropIndicator,
}: KanbanCardProps): JSX.Element {
  const navigate = useNavigate()

  function handleClick(): void {
    navigate(`/projects/${task.project_id}/tasks/${task.task_id}`)
  }

  function handleDragStart(e: React.DragEvent<HTMLDivElement>): void {
    e.dataTransfer.setData('text/plain', task.task_id)
    e.dataTransfer.setData('application/x-source-status', task.status)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>): void {
    e.preventDefault()
    e.stopPropagation()
    if (!onDragOverCard) return

    const rect = e.currentTarget.getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    const position = e.clientY < midY ? 'above' : 'below'
    onDragOverCard(task.task_id, position)
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>): void {
    e.stopPropagation()
    onDragLeaveCard?.()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>): void {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div className="relative">
      {/* Drop indicator above */}
      {dropIndicator === 'above' && (
        <div className="absolute -top-1 left-0 right-0 h-0.5 rounded-full bg-primary" />
      )}

      <div
        role="button"
        tabIndex={0}
        draggable={canDrag}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'cursor-pointer rounded-lg border border-border bg-card p-3 shadow-sm transition-colors hover:border-primary/50',
          canDrag && 'cursor-grab active:cursor-grabbing'
        )}
      >
        {/* Title */}
        <h4 className="truncate text-sm font-semibold text-foreground">{task.title}</h4>

        {/* Project name (Monthly Kanban only) */}
        {showProjectName && projectName && (
          <p className="mt-1 truncate text-xs text-muted-foreground">{projectName}</p>
        )}

        {/* Metadata row */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {/* Priority badge */}
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              priorityColor(task.priority)
            )}
          >
            <Flag className="h-3 w-3" />
            {task.priority}
          </span>

          {/* Due date */}
          {task.due_date && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-xs',
                isOverdue(task) ? 'font-medium text-red-500' : 'text-muted-foreground'
              )}
            >
              <Calendar className="h-3 w-3" />
              {formatDate(task.due_date)}
            </span>
          )}

          {/* Owner */}
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            {task.owner ?? 'Unassigned'}
          </span>
        </div>
      </div>

      {/* Drop indicator below */}
      {dropIndicator === 'below' && (
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-primary" />
      )}
    </div>
  )
})
