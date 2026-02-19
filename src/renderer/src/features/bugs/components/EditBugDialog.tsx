import { useState, useEffect, type FormEvent } from 'react'
import { bugService } from '@/services/bug-service'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import type { Bug } from '@shared/schemas'
import { X } from 'lucide-react'

interface EditBugDialogProps {
  open: boolean
  onClose: () => void
  bug: Bug
}

function toDateInputValue(isoString: string | null): string {
  if (!isoString) return ''
  return isoString.split('T')[0]
}

function toISODatetime(dateStr: string): string {
  return `${dateStr}T00:00:00.000Z`
}

export function EditBugDialog({ open, onClose, bug }: EditBugDialogProps): JSX.Element | null {
  const workspaceId = useWorkspaceId()
  const [title, setTitle] = useState(bug.title)
  const [description, setDescription] = useState(bug.description)
  const [status, setStatus] = useState(bug.status)
  const [severity, setSeverity] = useState(bug.severity)
  const [priority, setPriority] = useState(bug.priority)
  const [environment, setEnvironment] = useState(bug.environment)
  const [stepsToReproduce, setStepsToReproduce] = useState(bug.steps_to_reproduce)
  const [expectedResult, setExpectedResult] = useState(bug.expected_result)
  const [actualResult, setActualResult] = useState(bug.actual_result)
  const [assignee, setAssignee] = useState(bug.assignee ?? '')
  const [targetFixDate, setTargetFixDate] = useState(toDateInputValue(bug.target_fix_date))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setTitle(bug.title)
      setDescription(bug.description)
      setStatus(bug.status)
      setSeverity(bug.severity)
      setPriority(bug.priority)
      setEnvironment(bug.environment)
      setStepsToReproduce(bug.steps_to_reproduce)
      setExpectedResult(bug.expected_result)
      setActualResult(bug.actual_result)
      setAssignee(bug.assignee ?? '')
      setTargetFixDate(toDateInputValue(bug.target_fix_date))
      setError('')
    }
  }, [open, bug])

  if (!open) return null

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!workspaceId) return

    setError('')
    setLoading(true)

    try {
      // Build the resolved_at value: auto-fill when moving to Fixed/Verified/Closed
      let resolvedAt: string | null | undefined = undefined
      if (['Fixed', 'Verified', 'Closed'].includes(status) && !bug.resolved_at) {
        resolvedAt = new Date().toISOString()
      } else if (!['Fixed', 'Verified', 'Closed'].includes(status) && bug.resolved_at) {
        // Clear resolved_at if moving back to a non-resolved status
        resolvedAt = null
      }

      await bugService.updateBug(workspaceId, bug.bug_id, {
        title: title.trim(),
        description: description.trim(),
        status: status as Bug['status'],
        severity: severity as Bug['severity'],
        priority: priority as Bug['priority'],
        environment: environment.trim(),
        steps_to_reproduce: stepsToReproduce.trim(),
        expected_result: expectedResult.trim(),
        actual_result: actualResult.trim(),
        assignee: assignee.trim() || null,
        target_fix_date: targetFixDate ? toISODatetime(targetFixDate) : null,
        ...(resolvedAt !== undefined ? { resolved_at: resolvedAt } : {}),
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bug')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Edit Bug</h2>
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
            <label htmlFor="edit-bug-title" className="mb-1 block text-sm font-medium text-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              id="edit-bug-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="edit-bug-description" className="mb-1 block text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              id="edit-bug-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={20000}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="edit-bug-status" className="mb-1 block text-sm font-medium text-foreground">
                Status
              </label>
              <select
                id="edit-bug-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="New">New</option>
                <option value="Triaged">Triaged</option>
                <option value="In Progress">In Progress</option>
                <option value="Fixed">Fixed</option>
                <option value="Verified">Verified</option>
                <option value="Closed">Closed</option>
                <option value="Reopened">Reopened</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit-bug-severity" className="mb-1 block text-sm font-medium text-foreground">
                Severity
              </label>
              <select
                id="edit-bug-severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as typeof severity)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit-bug-priority" className="mb-1 block text-sm font-medium text-foreground">
                Priority
              </label>
              <select
                id="edit-bug-priority"
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

          <div>
            <label htmlFor="edit-bug-environment" className="mb-1 block text-sm font-medium text-foreground">
              Environment
            </label>
            <textarea
              id="edit-bug-environment"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              rows={2}
              maxLength={20000}
              placeholder="e.g., macOS 14.0, Chrome 120"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="edit-bug-steps" className="mb-1 block text-sm font-medium text-foreground">
              Steps to Reproduce
            </label>
            <textarea
              id="edit-bug-steps"
              value={stepsToReproduce}
              onChange={(e) => setStepsToReproduce(e.target.value)}
              rows={3}
              maxLength={20000}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-bug-expected" className="mb-1 block text-sm font-medium text-foreground">
                Expected Result
              </label>
              <textarea
                id="edit-bug-expected"
                value={expectedResult}
                onChange={(e) => setExpectedResult(e.target.value)}
                rows={2}
                maxLength={20000}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="edit-bug-actual" className="mb-1 block text-sm font-medium text-foreground">
                Actual Result
              </label>
              <textarea
                id="edit-bug-actual"
                value={actualResult}
                onChange={(e) => setActualResult(e.target.value)}
                rows={2}
                maxLength={20000}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-bug-assignee" className="mb-1 block text-sm font-medium text-foreground">
                Assignee (optional)
              </label>
              <input
                id="edit-bug-assignee"
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Assignee name"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="edit-bug-target-fix-date" className="mb-1 block text-sm font-medium text-foreground">
                Target Fix Date (optional)
              </label>
              <input
                id="edit-bug-target-fix-date"
                type="date"
                value={targetFixDate}
                onChange={(e) => setTargetFixDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
