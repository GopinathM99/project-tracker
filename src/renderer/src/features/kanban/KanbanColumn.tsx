import { useState, useCallback, memo } from 'react'
import { cn } from '@/lib/cn'
import { KanbanCard } from './KanbanCard'
import type { Task } from '@shared/schemas'

interface KanbanColumnProps {
  status: string
  tasks: Task[]
  canWrite: boolean
  onDrop: (taskId: string, newStatus: string, kanbanSortOrder?: number) => void
  showProjectName?: boolean
  projectNameMap?: Record<string, string>
}

function statusHeaderColor(status: string): string {
  switch (status) {
    case 'Not Started':
      return 'border-t-zinc-500'
    case 'In Progress':
      return 'border-t-blue-500'
    case 'Blocked':
      return 'border-t-red-500'
    case 'Done':
      return 'border-t-green-500'
    default:
      return 'border-t-zinc-500'
  }
}

function statusDotColor(status: string): string {
  switch (status) {
    case 'Not Started':
      return 'bg-zinc-500'
    case 'In Progress':
      return 'bg-blue-500'
    case 'Blocked':
      return 'bg-red-500'
    case 'Done':
      return 'bg-green-500'
    default:
      return 'bg-zinc-500'
  }
}

/**
 * Calculate a new kanban_sort_order based on neighbors.
 * Uses midpoint strategy for insertion between existing items.
 */
function calculateSortOrder(
  sortedTasks: Task[],
  dropIndex: number,
): number {
  if (sortedTasks.length === 0) {
    return 0
  }

  // Dropping at the very beginning
  if (dropIndex === 0) {
    const firstOrder = sortedTasks[0]?.kanban_sort_order ?? 0
    return firstOrder - 1000
  }

  // Dropping at the very end
  if (dropIndex >= sortedTasks.length) {
    const lastOrder = sortedTasks[sortedTasks.length - 1]?.kanban_sort_order ?? 0
    return lastOrder + 1000
  }

  // Dropping between two items
  const above = sortedTasks[dropIndex - 1]?.kanban_sort_order ?? 0
  const below = sortedTasks[dropIndex]?.kanban_sort_order ?? above + 2000
  return (above + below) / 2
}

export const KanbanColumn = memo(function KanbanColumn({
  status,
  tasks,
  canWrite,
  onDrop,
  showProjectName,
  projectNameMap,
}: KanbanColumnProps): JSX.Element {
  const [dragOver, setDragOver] = useState(false)
  const [dropTarget, setDropTarget] = useState<{ taskId: string; position: 'above' | 'below' } | null>(null)

  // Sort tasks by kanban_sort_order (nulls last), then by created_at
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.kanban_sort_order !== null && b.kanban_sort_order !== null) {
      return a.kanban_sort_order - b.kanban_sort_order
    }
    if (a.kanban_sort_order !== null) return -1
    if (b.kanban_sort_order !== null) return 1
    return a.created_at.localeCompare(b.created_at)
  })

  function handleDragOver(e: React.DragEvent<HTMLDivElement>): void {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(true)
  }

  function handleDragLeave(): void {
    setDragOver(false)
    setDropTarget(null)
  }

  const handleCardDragOver = useCallback(
    (taskId: string, position: 'above' | 'below') => {
      setDropTarget({ taskId, position })
    },
    [],
  )

  const handleCardDragLeave = useCallback(() => {
    // Don't clear immediately -- let the column dragLeave handle it
  }, [])

  function handleDrop(e: React.DragEvent<HTMLDivElement>): void {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    const sourceStatus = e.dataTransfer.getData('application/x-source-status')

    if (!taskId) {
      setDragOver(false)
      setDropTarget(null)
      return
    }

    // Determine drop index
    let dropIndex = sortedTasks.length // Default: end of column

    if (dropTarget) {
      const targetIdx = sortedTasks.findIndex((t) => t.task_id === dropTarget.taskId)
      if (targetIdx !== -1) {
        dropIndex = dropTarget.position === 'above' ? targetIdx : targetIdx + 1
      }
    }

    // Remove the dragged task from sorted list for order calculation
    const filteredTasks = sortedTasks.filter((t) => t.task_id !== taskId)

    // Adjust drop index if the task was removed before the drop position
    const draggedIdx = sortedTasks.findIndex((t) => t.task_id === taskId)
    if (draggedIdx !== -1 && draggedIdx < dropIndex) {
      dropIndex = Math.max(0, dropIndex - 1)
    }

    const newOrder = calculateSortOrder(filteredTasks, dropIndex)

    onDrop(taskId, status, newOrder)

    setDragOver(false)
    setDropTarget(null)
  }

  return (
    <div
      onDragOver={canWrite ? handleDragOver : undefined}
      onDragLeave={canWrite ? handleDragLeave : undefined}
      onDrop={canWrite ? handleDrop : undefined}
      className={cn(
        'flex w-72 shrink-0 flex-col rounded-lg border border-border border-t-4 bg-background',
        statusHeaderColor(status),
        dragOver && 'border-primary/50 bg-primary/5'
      )}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-3">
        <span className={cn('h-2.5 w-2.5 rounded-full', statusDotColor(status))} />
        <h3 className="text-sm font-semibold text-foreground">{status}</h3>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      {/* Scrollable task list */}
      <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2">
        {sortedTasks.map((task) => {
          let indicator: 'above' | 'below' | null = null
          if (dropTarget && dropTarget.taskId === task.task_id) {
            indicator = dropTarget.position
          }

          return (
            <KanbanCard
              key={task.task_id}
              task={task}
              canDrag={canWrite}
              showProjectName={showProjectName}
              projectName={projectNameMap?.[task.project_id]}
              onDragOverCard={canWrite ? handleCardDragOver : undefined}
              onDragLeaveCard={canWrite ? handleCardDragLeave : undefined}
              dropIndicator={indicator}
            />
          )
        })}
        {tasks.length === 0 && (
          <div className="py-8 text-center text-xs text-muted-foreground">No tasks</div>
        )}
      </div>
    </div>
  )
})
