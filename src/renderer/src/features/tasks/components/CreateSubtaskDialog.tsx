import { useState, type FormEvent } from 'react'
import { taskService } from '@/services/task-service'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { X } from 'lucide-react'

interface CreateSubtaskDialogProps {
  open: boolean
  onClose: () => void
  parentTaskId: string
  projectId: string
}

function todayDate(): string {
  return new Date().toISOString().split('T')[0]
}

function twoWeeksFromToday(): string {
  const date = new Date()
  date.setDate(date.getDate() + 14)
  return date.toISOString().split('T')[0]
}

function toISODatetime(dateStr: string): string {
  return `${dateStr}T00:00:00.000Z`
}

export function CreateSubtaskDialog({
  open,
  onClose,
  parentTaskId,
  projectId,
}: CreateSubtaskDialogProps): JSX.Element | null {
  const workspaceId = useWorkspaceId()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  function resetForm(): void {
    setTitle('')
    setDescription('')
    setPriority('Medium')
    setError('')
  }

  function handleClose(): void {
    resetForm()
    onClose()
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!workspaceId) return

    setError('')
    setLoading(true)

    try {
      await taskService.createTask(workspaceId, {
        project_id: projectId,
        parent_task_id: parentTaskId,
        title: title.trim(),
        description: description.trim(),
        priority,
        status: 'Not Started',
        start_date: toISODatetime(todayDate()),
        expected_completion_date: toISODatetime(twoWeeksFromToday()),
        due_date: null,
        owner: null,
        recurrence_id: null,
        kanban_sort_order: null,
        tag_ids: [],
      })
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subtask')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Add Subtask</h2>
          <button
            onClick={handleClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="subtask-title" className="mb-1 block text-sm font-medium text-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              id="subtask-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              placeholder="Subtask title"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="subtask-description" className="mb-1 block text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              id="subtask-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={20000}
              placeholder="Describe the subtask..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="subtask-priority" className="mb-1 block text-sm font-medium text-foreground">
              Priority
            </label>
            <select
              id="subtask-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as typeof priority)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Add Subtask'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
