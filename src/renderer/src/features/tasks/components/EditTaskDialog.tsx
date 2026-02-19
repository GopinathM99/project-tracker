import { useState, useEffect, type FormEvent } from 'react'
import { taskService } from '@/services/task-service'
import { projectService } from '@/services/project-service'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { MarkdownEditor } from '@/components/shared/MarkdownEditor'
import { validateFieldLength, validateTaskDatesInProject } from '@shared/utils/validation-helpers'
import { FIELD_LIMITS } from '@shared/constants/validation'
import type { Task, Project } from '@shared/schemas'
import { X, AlertTriangle } from 'lucide-react'

interface EditTaskDialogProps {
  open: boolean
  onClose: () => void
  task: Task
}

function toDateInputValue(isoString: string | null): string {
  if (!isoString) return ''
  return isoString.split('T')[0]
}

function toISODatetime(dateStr: string): string {
  return `${dateStr}T00:00:00.000Z`
}

export function EditTaskDialog({ open, onClose, task }: EditTaskDialogProps): JSX.Element | null {
  const workspaceId = useWorkspaceId()
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [status, setStatus] = useState(task.status)
  const [priority, setPriority] = useState(task.priority)
  const [startDate, setStartDate] = useState(toDateInputValue(task.start_date))
  const [expectedCompletionDate, setExpectedCompletionDate] = useState(
    toDateInputValue(task.expected_completion_date),
  )
  const [dueDate, setDueDate] = useState(toDateInputValue(task.due_date))
  const [owner, setOwner] = useState(task.owner ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [project, setProject] = useState<Project | null>(null)
  const [dateWarning, setDateWarning] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setTitle(task.title)
      setDescription(task.description)
      setStatus(task.status)
      setPriority(task.priority)
      setStartDate(toDateInputValue(task.start_date))
      setExpectedCompletionDate(toDateInputValue(task.expected_completion_date))
      setDueDate(toDateInputValue(task.due_date))
      setOwner(task.owner ?? '')
      setError('')
    }
  }, [open, task])

  // Fetch parent project for cross-entity date validation (FR-107)
  useEffect(() => {
    if (!workspaceId || !open) return
    projectService.getProject(workspaceId, task.project_id).then(setProject).catch(() => {})
  }, [workspaceId, task.project_id, open])

  // Check task dates against project range
  useEffect(() => {
    if (!project || !startDate || !expectedCompletionDate) {
      setDateWarning(null)
      return
    }
    const warning = validateTaskDatesInProject(
      {
        start_date: toISODatetime(startDate),
        expected_completion_date: toISODatetime(expectedCompletionDate),
        due_date: dueDate ? toISODatetime(dueDate) : null,
      },
      { start_date: project.start_date, target_end_date: project.target_end_date },
    )
    setDateWarning(warning)
  }, [project, startDate, expectedCompletionDate, dueDate])

  if (!open) return null

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!workspaceId) return

    setError('')

    const titleError = validateFieldLength(title.trim(), FIELD_LIMITS.TITLE_MAX, 'Title')
    if (titleError) {
      setError(titleError)
      return
    }

    const descError = validateFieldLength(description.trim(), FIELD_LIMITS.DESCRIPTION_MAX, 'Description')
    if (descError) {
      setError(descError)
      return
    }

    if (expectedCompletionDate < startDate) {
      setError('Expected completion date must be on or after start date')
      return
    }

    if (dueDate && dueDate < startDate) {
      setError('Due date must be on or after start date')
      return
    }

    setLoading(true)

    try {
      await taskService.updateTask(workspaceId, task.task_id, {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        start_date: toISODatetime(startDate),
        expected_completion_date: toISODatetime(expectedCompletionDate),
        due_date: dueDate ? toISODatetime(dueDate) : null,
        owner: owner.trim() || null,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Edit Task</h2>
          <button
            onClick={onClose}
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
            <label htmlFor="edit-task-title" className="mb-1 block text-sm font-medium text-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              id="edit-task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="edit-task-description" className="mb-1 block text-sm font-medium text-foreground">
              Description
            </label>
            <MarkdownEditor
              id="edit-task-description"
              value={description}
              onChange={setDescription}
              rows={3}
              maxLength={20000}
              placeholder="Describe the task... (Markdown supported)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-task-status" className="mb-1 block text-sm font-medium text-foreground">
                Status
              </label>
              <select
                id="edit-task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Blocked">Blocked</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit-task-priority" className="mb-1 block text-sm font-medium text-foreground">
                Priority
              </label>
              <select
                id="edit-task-priority"
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-task-start-date" className="mb-1 block text-sm font-medium text-foreground">
                Start Date
              </label>
              <input
                id="edit-task-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="edit-task-expected-date" className="mb-1 block text-sm font-medium text-foreground">
                Expected Completion
              </label>
              <input
                id="edit-task-expected-date"
                type="date"
                value={expectedCompletionDate}
                onChange={(e) => setExpectedCompletionDate(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* FR-107: Cross-entity date warning */}
          {dateWarning && (
            <div className="rounded-md border border-yellow-500/50 bg-yellow-500/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-600" />
                <p className="text-sm text-yellow-600">{dateWarning}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-task-due-date" className="mb-1 block text-sm font-medium text-foreground">
                Due Date (optional)
              </label>
              <input
                id="edit-task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="edit-task-owner" className="mb-1 block text-sm font-medium text-foreground">
                Owner (optional)
              </label>
              <input
                id="edit-task-owner"
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="Assignee name"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
