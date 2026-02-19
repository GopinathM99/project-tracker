import { useState, useMemo } from 'react'
import { dependencyService, checkCircularDependency } from '@/services/dependency-service'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import type { Task } from '@shared/schemas'
import type { DependencyLink } from '@shared/schemas'
import { X, Search, CircleDot, AlertTriangle } from 'lucide-react'

interface AddDependencyDialogProps {
  open: boolean
  onClose: () => void
  currentTask: Task
  projectTasks: Task[]
  dependencies: DependencyLink[]
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

export function AddDependencyDialog({
  open,
  onClose,
  currentTask,
  projectTasks,
  dependencies,
}: AddDependencyDialogProps): JSX.Element | null {
  const workspaceId = useWorkspaceId()
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  // Get IDs of tasks that are already dependencies for the current task
  const existingDepFromIds = new Set(
    dependencies
      .filter((d) => d.to_task_id === currentTask.task_id)
      .map((d) => d.from_task_id),
  )

  // Collect all subtask IDs of the current task (to exclude from the list)
  function getSubtaskIds(parentId: string): Set<string> {
    const ids = new Set<string>()
    const queue = [parentId]
    while (queue.length > 0) {
      const current = queue.shift()!
      for (const t of projectTasks) {
        if (t.parent_task_id === current && !ids.has(t.task_id)) {
          ids.add(t.task_id)
          queue.push(t.task_id)
        }
      }
    }
    return ids
  }

  const subtaskIds = getSubtaskIds(currentTask.task_id)

  // Filter available tasks: exclude current task, its subtasks, and already-added dependencies
  const availableTasks = useMemo(() => {
    return projectTasks.filter((t) => {
      if (t.task_id === currentTask.task_id) return false
      if (subtaskIds.has(t.task_id)) return false
      if (existingDepFromIds.has(t.task_id)) return false
      if (t.deleted_at !== null) return false
      if (searchQuery) {
        return t.title.toLowerCase().includes(searchQuery.toLowerCase())
      }
      return true
    })
  }, [projectTasks, currentTask.task_id, searchQuery, existingDepFromIds, subtaskIds])

  async function handleSelectTask(selectedTask: Task): Promise<void> {
    if (!workspaceId) return

    setError('')

    // Check for circular dependency
    const wouldCycle = checkCircularDependency(
      dependencies,
      selectedTask.task_id,
      currentTask.task_id,
    )

    if (wouldCycle) {
      setError(
        `Cannot add "${selectedTask.title}" as a dependency: this would create a circular dependency.`,
      )
      return
    }

    setLoading(true)
    try {
      await dependencyService.createDependency(
        workspaceId,
        selectedTask.task_id,
        currentTask.task_id,
      )
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add dependency')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Add Dependency</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-3 text-sm text-muted-foreground">
          Select a task that must be completed before &ldquo;{currentTask.title}&rdquo; can start.
        </p>

        {error && (
          <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Task list */}
        <div className="max-h-64 overflow-y-auto rounded-md border border-border">
          {availableTasks.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No available tasks to add as dependency.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {availableTasks.map((task) => (
                <button
                  key={task.task_id}
                  onClick={() => handleSelectTask(task)}
                  disabled={loading}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                    {task.title}
                  </span>
                  <span
                    className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusColor(task.status)}`}
                  >
                    <CircleDot className="h-2.5 w-2.5" />
                    {task.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
