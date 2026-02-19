import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { taskService } from '@/services/task-service'
import { dependencyService, getBlockedStatus } from '@/services/dependency-service'
import { useDependencies } from '@/hooks/useDependencies'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { useCanWrite } from '@/hooks/usePermission'
import { AddDependencyDialog } from './AddDependencyDialog'
import type { Task } from '@shared/schemas'
import { Link2, Plus, X, ArrowRight, AlertTriangle, CircleDot } from 'lucide-react'

interface DependencySectionProps {
  task: Task
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

export function DependencySection({ task, projectId }: DependencySectionProps): JSX.Element {
  const workspaceId = useWorkspaceId()
  const canWrite = useCanWrite()
  const { dependencies, loading: depsLoading } = useDependencies()
  const [projectTasks, setProjectTasks] = useState<Task[]>([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (!workspaceId) return

    setTasksLoading(true)
    const unsubscribe = taskService.subscribeToProjectTasks(
      workspaceId,
      projectId,
      (tasks) => {
        setProjectTasks(tasks)
        setTasksLoading(false)
      },
    )

    return () => {
      unsubscribe()
    }
  }, [workspaceId, projectId])

  const taskMap = useMemo(
    () => new Map(projectTasks.map((t) => [t.task_id, t])),
    [projectTasks],
  )

  // Dependencies where this task is the dependent (to_task_id) - "Depends On"
  const dependsOnDeps = useMemo(
    () => dependencies.filter((d) => d.to_task_id === task.task_id),
    [dependencies, task.task_id],
  )

  // Dependencies where this task is the prerequisite (from_task_id) - "Blocks"
  const blocksDeps = useMemo(
    () => dependencies.filter((d) => d.from_task_id === task.task_id),
    [dependencies, task.task_id],
  )

  // Check blocked status
  const { isBlocked, blockedBy } = useMemo(
    () => getBlockedStatus(task, dependencies, projectTasks),
    [task, dependencies, projectTasks],
  )

  async function handleRemoveDependency(dependencyId: string): Promise<void> {
    if (!workspaceId) return

    setRemovingId(dependencyId)
    try {
      await dependencyService.removeDependency(workspaceId, dependencyId)
    } catch {
      // Silently fail - the subscription will keep UI consistent
    } finally {
      setRemovingId(null)
    }
  }

  const loading = depsLoading || tasksLoading

  return (
    <div className="mt-6 rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Dependencies</h2>
        </div>
        {canWrite && (
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Dependency
          </button>
        )}
      </div>

      {/* Blocked warning banner (FR-053) */}
      {isBlocked && (
        <div className="mb-3 rounded-md border border-orange-500/50 bg-orange-500/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-orange-600" />
            <p className="text-sm text-orange-600">
              This task is blocked by {blockedBy.length} incomplete{' '}
              {blockedBy.length === 1 ? 'dependency' : 'dependencies'}
            </p>
          </div>
        </div>
      )}

      {loading && (
        <p className="text-sm text-muted-foreground">Loading dependencies...</p>
      )}

      {!loading && (
        <>
          {/* Depends On section */}
          <div className="mb-4">
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Depends On
            </h3>
            {dependsOnDeps.length === 0 ? (
              <p className="text-sm text-muted-foreground">No dependencies.</p>
            ) : (
              <div className="space-y-1">
                {dependsOnDeps.map((dep) => {
                  const fromTask = taskMap.get(dep.from_task_id)
                  const isIncomplete = fromTask && fromTask.status !== 'Done'
                  return (
                    <div
                      key={dep.dependency_id}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/50"
                    >
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      {fromTask ? (
                        <Link
                          to={`/projects/${projectId}/tasks/${fromTask.task_id}`}
                          className="min-w-0 flex-1 truncate text-sm text-foreground hover:underline"
                        >
                          {fromTask.title}
                        </Link>
                      ) : (
                        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground italic">
                          Unknown task
                        </span>
                      )}

                      {fromTask && (
                        <span
                          className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusColor(fromTask.status)}`}
                        >
                          <CircleDot className="h-2.5 w-2.5" />
                          {fromTask.status}
                        </span>
                      )}

                      {isIncomplete && (
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                      )}

                      {canWrite && (
                        <button
                          onClick={() => handleRemoveDependency(dep.dependency_id)}
                          disabled={removingId === dep.dependency_id}
                          className="shrink-0 rounded-md p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Blocks section */}
          <div>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Blocks
            </h3>
            {blocksDeps.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks depend on this one.</p>
            ) : (
              <div className="space-y-1">
                {blocksDeps.map((dep) => {
                  const toTask = taskMap.get(dep.to_task_id)
                  return (
                    <div
                      key={dep.dependency_id}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/50"
                    >
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      {toTask ? (
                        <Link
                          to={`/projects/${projectId}/tasks/${toTask.task_id}`}
                          className="min-w-0 flex-1 truncate text-sm text-foreground hover:underline"
                        >
                          {toTask.title}
                        </Link>
                      ) : (
                        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground italic">
                          Unknown task
                        </span>
                      )}

                      {toTask && (
                        <span
                          className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusColor(toTask.status)}`}
                        >
                          <CircleDot className="h-2.5 w-2.5" />
                          {toTask.status}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      {addOpen && (
        <AddDependencyDialog
          open={addOpen}
          onClose={() => setAddOpen(false)}
          currentTask={task}
          projectTasks={projectTasks}
          dependencies={dependencies}
        />
      )}
    </div>
  )
}
