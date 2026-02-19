import { useState, type FormEvent } from 'react'
import { milestoneService } from '@/services/milestone-service'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { X } from 'lucide-react'

interface CreateMilestoneDialogProps {
  open: boolean
  onClose: () => void
  projectId: string
}

function twoWeeksFromToday(): string {
  const date = new Date()
  date.setDate(date.getDate() + 14)
  return date.toISOString().split('T')[0]
}

function toISODatetime(dateStr: string): string {
  return `${dateStr}T00:00:00.000Z`
}

export function CreateMilestoneDialog({
  open,
  onClose,
  projectId,
}: CreateMilestoneDialogProps): JSX.Element | null {
  const workspaceId = useWorkspaceId()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState(twoWeeksFromToday())
  const [startDate, setStartDate] = useState('')
  const [owner, setOwner] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  function resetForm(): void {
    setTitle('')
    setDescription('')
    setTargetDate(twoWeeksFromToday())
    setStartDate('')
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
    setLoading(true)

    try {
      await milestoneService.createMilestone(workspaceId, projectId, {
        title: title.trim(),
        description: description.trim(),
        status: 'Planned',
        target_date: toISODatetime(targetDate),
        start_date: startDate ? toISODatetime(startDate) : null,
        owner: owner.trim() || null,
        linked_task_ids: [],
      })
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create milestone')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Create Milestone</h2>
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
            <label htmlFor="milestone-title" className="mb-1 block text-sm font-medium text-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              id="milestone-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              placeholder="Milestone title"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label
              htmlFor="milestone-description"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Description
            </label>
            <textarea
              id="milestone-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={20000}
              placeholder="Describe the milestone..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="milestone-target-date"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Target Date <span className="text-destructive">*</span>
              </label>
              <input
                id="milestone-target-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label
                htmlFor="milestone-start-date"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Start Date (optional)
              </label>
              <input
                id="milestone-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label htmlFor="milestone-owner" className="mb-1 block text-sm font-medium text-foreground">
              Owner (optional)
            </label>
            <input
              id="milestone-owner"
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="Owner name"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
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
              {loading ? 'Creating...' : 'Create Milestone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
