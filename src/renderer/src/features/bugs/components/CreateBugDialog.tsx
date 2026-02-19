import { useState, type FormEvent } from 'react'
import { bugService } from '@/services/bug-service'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { auth } from '@/lib/auth'
import { MarkdownEditor } from '@/components/shared/MarkdownEditor'
import { X } from 'lucide-react'

interface CreateBugDialogProps {
  open: boolean
  onClose: () => void
  projectId: string
}

function toISODatetime(dateStr: string): string {
  return `${dateStr}T00:00:00.000Z`
}

export function CreateBugDialog({ open, onClose, projectId }: CreateBugDialogProps): JSX.Element | null {
  const workspaceId = useWorkspaceId()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium')
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium')
  const [environment, setEnvironment] = useState('')
  const [stepsToReproduce, setStepsToReproduce] = useState('')
  const [expectedResult, setExpectedResult] = useState('')
  const [actualResult, setActualResult] = useState('')
  const [assignee, setAssignee] = useState('')
  const [targetFixDate, setTargetFixDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  function resetForm(): void {
    setTitle('')
    setDescription('')
    setSeverity('Medium')
    setPriority('Medium')
    setEnvironment('')
    setStepsToReproduce('')
    setExpectedResult('')
    setActualResult('')
    setAssignee('')
    setTargetFixDate('')
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
      const now = new Date().toISOString()
      await bugService.createBug(workspaceId, {
        project_id: projectId,
        title: title.trim(),
        description: description.trim(),
        status: 'New',
        severity,
        priority,
        reporter: auth.currentUser?.uid ?? '',
        assignee: assignee.trim() || null,
        environment: environment.trim(),
        steps_to_reproduce: stepsToReproduce.trim(),
        expected_result: expectedResult.trim(),
        actual_result: actualResult.trim(),
        reported_at: now,
        target_fix_date: targetFixDate ? toISODatetime(targetFixDate) : null,
        tag_ids: [],
      })
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bug')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Report Bug</h2>
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
            <label htmlFor="bug-title" className="mb-1 block text-sm font-medium text-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              id="bug-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              placeholder="Bug title"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="bug-description" className="mb-1 block text-sm font-medium text-foreground">
              Description
            </label>
            <MarkdownEditor
              id="bug-description"
              value={description}
              onChange={setDescription}
              rows={3}
              maxLength={20000}
              placeholder="Describe the bug... (Markdown supported)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="bug-severity" className="mb-1 block text-sm font-medium text-foreground">
                Severity
              </label>
              <select
                id="bug-severity"
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
              <label htmlFor="bug-priority" className="mb-1 block text-sm font-medium text-foreground">
                Priority
              </label>
              <select
                id="bug-priority"
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
            <label htmlFor="bug-environment" className="mb-1 block text-sm font-medium text-foreground">
              Environment
            </label>
            <textarea
              id="bug-environment"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              rows={2}
              maxLength={20000}
              placeholder="e.g., macOS 14.0, Chrome 120"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="bug-steps" className="mb-1 block text-sm font-medium text-foreground">
              Steps to Reproduce
            </label>
            <textarea
              id="bug-steps"
              value={stepsToReproduce}
              onChange={(e) => setStepsToReproduce(e.target.value)}
              rows={3}
              maxLength={20000}
              placeholder="1. Go to...&#10;2. Click on...&#10;3. Observe..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="bug-expected" className="mb-1 block text-sm font-medium text-foreground">
                Expected Result
              </label>
              <textarea
                id="bug-expected"
                value={expectedResult}
                onChange={(e) => setExpectedResult(e.target.value)}
                rows={2}
                maxLength={20000}
                placeholder="What should happen"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="bug-actual" className="mb-1 block text-sm font-medium text-foreground">
                Actual Result
              </label>
              <textarea
                id="bug-actual"
                value={actualResult}
                onChange={(e) => setActualResult(e.target.value)}
                rows={2}
                maxLength={20000}
                placeholder="What actually happens"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="bug-assignee" className="mb-1 block text-sm font-medium text-foreground">
                Assignee (optional)
              </label>
              <input
                id="bug-assignee"
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Assignee name"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="bug-target-fix-date" className="mb-1 block text-sm font-medium text-foreground">
                Target Fix Date (optional)
              </label>
              <input
                id="bug-target-fix-date"
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
              {loading ? 'Reporting...' : 'Report Bug'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
