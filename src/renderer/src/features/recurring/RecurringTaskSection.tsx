import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Plus, Pause, Play, Pencil, Trash2 } from 'lucide-react'
import { recurringTaskService } from '@/services/recurring-task-service'
import { taskService } from '@/services/task-service'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { useCanWrite } from '@/hooks/usePermission'
import { CreateRecurrenceDialog } from './CreateRecurrenceDialog'
import type { RecurringTaskDefinition, Task } from '@shared/schemas'

interface RecurringTaskSectionProps {
  projectId: string
  tasks: Task[]
}

function formatIntervalDescription(rec: RecurringTaskDefinition): string {
  const val = rec.interval_value
  switch (rec.interval_type) {
    case 'Daily':
      return val === 1 ? 'Every day' : `Every ${val} days`
    case 'Weekly':
      return val === 1 ? 'Every week' : `Every ${val} weeks`
    case 'Monthly':
      return val === 1 ? 'Every month' : `Every ${val} months`
    case 'Custom':
      return `Every ${val} days (custom)`
    default:
      return `Every ${val} ${rec.interval_type}`
  }
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString()
}

export function RecurringTaskSection({
  projectId,
  tasks,
}: RecurringTaskSectionProps): JSX.Element {
  const workspaceId = useWorkspaceId()
  const canWrite = useCanWrite()

  const [recurrences, setRecurrences] = useState<RecurringTaskDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [templateNames, setTemplateNames] = useState<Record<string, string>>({})

  const loadRecurrences = useCallback(async () => {
    if (!workspaceId) return
    setLoading(true)
    try {
      const recs = await recurringTaskService.getProjectRecurrences(workspaceId, projectId)
      setRecurrences(recs)

      // Resolve template task names
      const names: Record<string, string> = {}
      for (const rec of recs) {
        const task = await taskService.getTask(workspaceId, rec.template_task_id)
        names[rec.template_task_id] = task?.title ?? '(Deleted Task)'
      }
      setTemplateNames(names)
    } catch {
      // Error handling
    } finally {
      setLoading(false)
    }
  }, [workspaceId, projectId])

  useEffect(() => {
    loadRecurrences()
  }, [loadRecurrences])

  async function handleToggleActive(rec: RecurringTaskDefinition): Promise<void> {
    if (!workspaceId) return
    await recurringTaskService.updateRecurrence(workspaceId, rec.recurrence_id, {
      is_active: !rec.is_active,
    })
    await loadRecurrences()
  }

  async function handleDelete(recurrenceId: string): Promise<void> {
    if (!workspaceId) return
    await recurringTaskService.deleteRecurrence(workspaceId, recurrenceId)
    setRecurrences((prev) => prev.filter((r) => r.recurrence_id !== recurrenceId))
  }

  async function handleGenerateNow(): Promise<void> {
    if (!workspaceId) return
    await recurringTaskService.checkAndGenerateDue(workspaceId)
    await loadRecurrences()
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-foreground">
          <RefreshCw className="h-5 w-5" />
          Recurring Tasks
        </h2>
        <div className="flex items-center gap-2">
          {canWrite && (
            <>
              <button
                onClick={handleGenerateNow}
                className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                title="Generate due tasks now"
              >
                <RefreshCw className="h-4 w-4" />
                Generate Due
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Create Recurrence
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-4 text-center text-sm text-muted-foreground">Loading...</div>
      ) : recurrences.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No recurring task definitions. Create one to auto-generate tasks on a schedule.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {recurrences.map((rec) => (
            <div
              key={rec.recurrence_id}
              className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-foreground truncate">
                  {templateNames[rec.template_task_id] ?? 'Loading...'}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {formatIntervalDescription(rec)} &middot; Next:{' '}
                  {formatDate(rec.next_generation_date)}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  rec.is_active
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-zinc-500/10 text-zinc-500'
                }`}
              >
                {rec.is_active ? 'Active' : 'Paused'}
              </span>

              {canWrite && (
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(rec)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                    title={rec.is_active ? 'Pause' : 'Resume'}
                  >
                    {rec.is_active ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(rec.recurrence_id)}
                    className="rounded-md p-1 text-destructive hover:bg-destructive/10"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <CreateRecurrenceDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        projectId={projectId}
        tasks={tasks}
        onCreated={loadRecurrences}
      />
    </div>
  )
}
