import { useState, useEffect, type FormEvent } from 'react'
import { taskService } from '@/services/task-service'
import { projectService } from '@/services/project-service'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { MarkdownEditor } from '@/components/shared/MarkdownEditor'
import { validateFieldLength, validateTaskDatesInProject } from '@shared/utils/validation-helpers'
import { FIELD_LIMITS } from '@shared/constants/validation'
import type { Project } from '@shared/schemas'
import { X, AlertTriangle } from 'lucide-react'

interface CreateTaskDialogProps {
  open: boolean
  onClose: () => void
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

export function CreateTaskDialog({ open, onClose, projectId }: CreateTaskDialogProps): JSX.Element | null {
  const workspaceId = useWorkspaceId()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium')
  const [startDate, setStartDate] = useState(todayDate())
  const [expectedCompletionDate, setExpectedCompletionDate] = useState(twoWeeksFromToday())
  const [dueDate, setDueDate] = useState('')
  const [owner, setOwner] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [project, setProject] = useState<Project | null>(null)
  const [dateWarning, setDateWarning] = useState<string | null>(null)

  // Fetch parent project for cross-entity date validation (FR-107)
  useEffect(() => {
    if (!workspaceId || !open) return
    projectService.getProject(workspaceId, projectId).then(setProject).catch(() => {})
  }, [workspaceId, projectId, open])

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

  function resetForm(): void {
    setTitle('')
    setDescription('')
    setPriority('Medium')
    setStartDate(todayDate())
    setExpectedCompletionDate(twoWeeksFromToday())
    setDueDate('')
    setOwner('')
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
      await taskService.createTask(workspaceId, {
        project_id: projectId,
        parent_task_id: null,
        title: title.trim(),
        description: description.trim(),
        priority,
        status: 'Not Started',
        start_date: toISODatetime(startDate),
        expected_completion_date: toISODatetime(expectedCompletionDate),
        due_date: dueDate ? toISODatetime(dueDate) : null,
        owner: owner.trim() || null,
        recurrence_id: null,
        kanban_sort_order: null,
        tag_ids: [],
      })
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Create Task</h2>
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
            <label htmlFor="task-title" className="mb-1 block text-sm font-medium text-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              placeholder="Task title"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="task-description" className="mb-1 block text-sm font-medium text-foreground">
              Description
            </label>
            <MarkdownEditor
              id="task-description"
              value={description}
              onChange={setDescription}
              rows={3}
              maxLength={20000}
              placeholder="Describe the task... (Markdown supported)"
            />
          </div>

          <div>
            <label htmlFor="task-priority" className="mb-1 block text-sm font-medium text-foreground">
              Priority
            </label>
            <select
              id="task-priority"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-start-date" className="mb-1 block text-sm font-medium text-foreground">
                Start Date
              </label>
              <input
                id="task-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="task-expected-date" className="mb-1 block text-sm font-medium text-foreground">
                Expected Completion
              </label>
              <input
                id="task-expected-date"
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
              <label htmlFor="task-due-date" className="mb-1 block text-sm font-medium text-foreground">
                Due Date (optional)
              </label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="task-owner" className="mb-1 block text-sm font-medium text-foreground">
                Owner (optional)
              </label>
              <input
                id="task-owner"
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
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
