import type { Task } from '@shared/schemas'
import { TaskCard } from './TaskCard'
import { useBulkActions } from '@/hooks/useBulkActions'
import { usePagination } from '@/hooks/usePagination'
import { BulkActionsBar } from '@/features/bulk-actions/BulkActionsBar'
import { bulkActionService } from '@/services/bulk-action-service'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface TaskListProps {
  tasks: Task[]
  projectId: string
}

export function TaskList({ tasks, projectId }: TaskListProps): JSX.Element {
  const workspaceId = useWorkspaceId()
  const {
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    isSelected,
    selectedCount,
  } = useBulkActions<Task>(tasks, 'task_id')

  const { page, totalPages, paginatedItems, goToPage, nextPage, prevPage } =
    usePagination(tasks, 50)

  if (tasks.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No tasks match the current filters.
      </p>
    )
  }

  async function handleStatusChange(status: string): Promise<void> {
    if (!workspaceId) return
    const ids = Array.from(selectedIds)
    await bulkActionService.bulkUpdateTasks(workspaceId, ids, { status: status as Task['status'] })
    clearSelection()
  }

  async function handlePriorityChange(priority: string): Promise<void> {
    if (!workspaceId) return
    const ids = Array.from(selectedIds)
    await bulkActionService.bulkUpdateTasks(workspaceId, ids, { priority: priority as Task['priority'] })
    clearSelection()
  }

  async function handleOwnerChange(owner: string): Promise<void> {
    if (!workspaceId) return
    const ids = Array.from(selectedIds)
    await bulkActionService.bulkUpdateTasks(workspaceId, ids, { owner })
    clearSelection()
  }

  async function handleDelete(): Promise<void> {
    if (!workspaceId) return
    const ids = Array.from(selectedIds)
    await bulkActionService.bulkDeleteTasks(workspaceId, ids)
    clearSelection()
  }

  return (
    <div>
      {/* Select All header */}
      <div className="mb-2 flex items-center gap-2">
        <input
          type="checkbox"
          checked={selectedCount > 0 && selectedCount === tasks.length}
          onChange={() => {
            if (selectedCount === tasks.length) {
              clearSelection()
            } else {
              selectAll()
            }
          }}
          className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
        />
        <span className="text-xs text-muted-foreground">
          {selectedCount > 0 ? `${selectedCount} selected` : 'Select all'}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {paginatedItems.map((task) => (
          <TaskCard
            key={task.task_id}
            task={task}
            projectId={projectId}
            selected={isSelected(task.task_id)}
            onSelect={() => toggleSelect(task.task_id)}
          />
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={prevPage}
            disabled={page === 1}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Bulk actions bar */}
      <BulkActionsBar
        selectedCount={selectedCount}
        entityType="task"
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
        onOwnerChange={handleOwnerChange}
        onDelete={handleDelete}
        onClearSelection={clearSelection}
      />
    </div>
  )
}
