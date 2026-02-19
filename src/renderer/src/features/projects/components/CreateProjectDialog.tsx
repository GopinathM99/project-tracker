import { useState, type FormEvent } from 'react'
import { projectService } from '@/services/project-service'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { validateProjectDates, validateFieldLength } from '@shared/utils/validation-helpers'
import { FIELD_LIMITS } from '@shared/constants/validation'
import { X } from 'lucide-react'

interface CreateProjectDialogProps {
  open: boolean
  onClose: () => void
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function toISODateTime(dateStr: string): string {
  return `${dateStr}T00:00:00.000Z`
}

export function CreateProjectDialog({ open, onClose }: CreateProjectDialogProps): JSX.Element | null {
  const workspaceId = useWorkspaceId()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState(todayISO())
  const [targetEndDate, setTargetEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  function resetForm(): void {
    setName('')
    setDescription('')
    setStartDate(todayISO())
    setTargetEndDate('')
    setError(null)
  }

  function handleClose(): void {
    resetForm()
    onClose()
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>): void {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError(null)

    if (!workspaceId) {
      setError('No workspace selected')
      return
    }

    if (!name.trim()) {
      setError('Project name is required')
      return
    }

    const nameError = validateFieldLength(name.trim(), FIELD_LIMITS.TITLE_MAX, 'Project name')
    if (nameError) {
      setError(nameError)
      return
    }

    const descError = validateFieldLength(description.trim(), FIELD_LIMITS.DESCRIPTION_MAX, 'Description')
    if (descError) {
      setError(descError)
      return
    }

    if (!targetEndDate) {
      setError('Target end date is required')
      return
    }

    const dateError = validateProjectDates(startDate, targetEndDate)
    if (dateError) {
      setError(dateError)
      return
    }

    setLoading(true)

    try {
      await projectService.createProject(workspaceId, {
        name: name.trim(),
        description: description.trim(),
        status: 'Active',
        start_date: toISODateTime(startDate),
        target_end_date: toISODateTime(targetEndDate),
        folder_id: null,
        tag_ids: [],
      })
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Create Project</h2>
          <button
            onClick={handleClose}
            className="rounded-md px-1 py-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="project-name" className="mb-1 block text-sm font-medium text-foreground">
              Name
            </label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={200}
              placeholder="Project name"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="project-description" className="mb-1 block text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={20000}
              placeholder="Describe this project (optional)"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="project-start-date" className="mb-1 block text-sm font-medium text-foreground">
                Start Date
              </label>
              <input
                id="project-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="project-end-date" className="mb-1 block text-sm font-medium text-foreground">
                Target End Date
              </label>
              <input
                id="project-end-date"
                type="date"
                value={targetEndDate}
                onChange={(e) => setTargetEndDate(e.target.value)}
                required
                min={startDate}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
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
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
