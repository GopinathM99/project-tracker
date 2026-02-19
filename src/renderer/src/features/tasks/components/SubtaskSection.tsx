import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { taskService } from '@/services/task-service'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { useCanWrite } from '@/hooks/usePermission'
import { CreateSubtaskDialog } from './CreateSubtaskDialog'
import type { Task } from '@shared/schemas'
import { Plus, CheckSquare, Square, CircleDot, Flag, GitBranch } from 'lucide-react'

interface SubtaskSectionProps {
  parentTask: Task
  projectId: string
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

export function SubtaskSection({ parentTask, projectId }: SubtaskSectionProps): JSX.Element {
  const workspaceId = useWorkspaceId()
  const canWrite = useCanWrite()
  const [subtasks, setSubtasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    if (!workspaceId) return

    setLoading(true)
    // Subscribe to tasks that are children of this parent
    const unsubscribe = taskService.subscribeToProjectTasks(
      workspaceId,
      projectId,
      (tasks) => {
        const children = tasks.filter(
          (t) => t.parent_task_id === parentTask.task_id && t.deleted_at === null,
        )
        setSubtasks(children)
        setLoading(false)
      },
    )

    return () => {
      unsubscribe()
    }
  }, [workspaceId, projectId, parentTask.task_id])

  async function handleToggleStatus(subtask: Task): Promise<void> {
    if (!workspaceId) return

    const newStatus: Task['status'] = subtask.status === 'Done' ? 'Not Started' : 'Done'
    try {
      await taskService.updateTask(workspaceId, subtask.task_id, { status: newStatus })
    } catch {
      // Silently fail - the subscription will keep UI consistent
    }
  }

  function handleCreateClose(): void {
    setCreateOpen(false)
  }

  const doneCount = subtasks.filter((s) => s.status === 'Done').length

  return (
    <div className="mt-6 rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">
            Subtasks
            {subtasks.length > 0 && (
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                ({doneCount} of {subtasks.length} done)
              </span>
            )}
          </h2>
        </div>
        {canWrite && (
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Subtask
          </button>
        )}
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground">Loading subtasks...</p>
      )}

      {!loading && subtasks.length === 0 && (
        <p className="text-sm text-muted-foreground">No subtasks yet.</p>
      )}

      {!loading && subtasks.length > 0 && (
        <>
          {/* Progress bar */}
          <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${subtasks.length > 0 ? (doneCount / subtasks.length) * 100 : 0}%` }}
            />
          </div>

          <div className="space-y-1">
            {subtasks.map((subtask) => (
              <div
                key={subtask.task_id}
                className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent/50"
              >
                {canWrite ? (
                  <button
                    onClick={() => handleToggleStatus(subtask)}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    {subtask.status === 'Done' ? (
                      <CheckSquare className="h-4 w-4 text-green-500" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                ) : (
                  <span className="shrink-0">
                    {subtask.status === 'Done' ? (
                      <CheckSquare className="h-4 w-4 text-green-500" />
                    ) : (
                      <Square className="h-4 w-4 text-muted-foreground" />
                    )}
                  </span>
                )}

                <Link
                  to={`/projects/${projectId}/tasks/${subtask.task_id}`}
                  className={`min-w-0 flex-1 truncate text-sm hover:underline ${
                    subtask.status === 'Done'
                      ? 'text-muted-foreground line-through'
                      : 'text-foreground'
                  }`}
                >
                  {subtask.title}
                </Link>

                <div className="flex shrink-0 items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusColor(subtask.status)}`}
                  >
                    <CircleDot className="h-2.5 w-2.5" />
                    {subtask.status}
                  </span>
                  <span
                    className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${priorityColor(subtask.priority)}`}
                  >
                    <Flag className="h-2.5 w-2.5" />
                    {subtask.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {createOpen && (
        <CreateSubtaskDialog
          open={createOpen}
          onClose={handleCreateClose}
          parentTaskId={parentTask.task_id}
          projectId={projectId}
        />
      )}
    </div>
  )
}
