import { useState, useEffect, type FormEvent } from 'react'
import { milestoneService } from '@/services/milestone-service'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { X, Link2 } from 'lucide-react'
import type { Milestone, Task } from '@shared/schemas'

interface EditMilestoneDialogProps {
  open: boolean
  onClose: () => void
  milestone: Milestone
  tasks: Task[]
}

function toDateInput(isoDatetime: string | null): string {
  if (!isoDatetime) return ''
  return isoDatetime.split('T')[0]
}

function toISODatetime(dateStr: string): string {
  return `${dateStr}T00:00:00.000Z`
}

export function EditMilestoneDialog({
  open,
  onClose,
  milestone,
  tasks,
}: EditMilestoneDialogProps): JSX.Element | null {
  const workspaceId = useWorkspaceId()
  const [title, setTitle] = useState(milestone.title)
  const [description, setDescription] = useState(milestone.description)
  const [status, setStatus] = useState(milestone.status)
  const [targetDate, setTargetDate] = useState(toDateInput(milestone.target_date))
  const [startDate, setStartDate] = useState(toDateInput(milestone.start_date))
  const [owner, setOwner] = useState(milestone.owner ?? '')
  const [linkedTaskIds, setLinkedTaskIds] = useState<string[]>(milestone.linked_task_ids)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset form when milestone changes
  useEffect(() => {
    setTitle(milestone.title)
    setDescription(milestone.description)
    setStatus(milestone.status)
    setTargetDate(toDateInput(milestone.target_date))
    setStartDate(toDateInput(milestone.start_date))
    setOwner(milestone.owner ?? '')
    setLinkedTaskIds(milestone.linked_task_ids)
    setError('')
  }, [milestone])

  if (!open) return null

  function handleClose(): void {
    setError('')
    onClose()
  }

  function handleTaskToggle(taskId: string): void {
    setLinkedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId],
    )
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!workspaceId) return

    setError('')
    setLoading(true)

    try {
      const completedAt =
        status === 'Completed' && milestone.status !== 'Completed'
          ? new Date().toISOString()
          : status !== 'Completed'
            ? null
            : milestone.completed_at

      await milestoneService.updateMilestone(workspaceId, milestone.milestone_id, {
        title: title.trim(),
        description: description.trim(),
        status,
        target_date: toISODatetime(targetDate),
        start_date: startDate ? toISODatetime(startDate) : null,
        completed_at: completedAt,
        owner: owner.trim() || null,
        linked_task_ids: linkedTaskIds,
      })
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update milestone')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Edit Milestone</h2>
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
            <label
              htmlFor="edit-milestone-title"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Title <span className="text-destructive">*</span>
            </label>
            <input
              id="edit-milestone-title"
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
              htmlFor="edit-milestone-description"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Description
            </label>
            <textarea
              id="edit-milestone-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={20000}
              placeholder="Describe the milestone..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label
              htmlFor="edit-milestone-status"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Status
            </label>
            <select
              id="edit-milestone-status"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as 'Planned' | 'In Progress' | 'Completed' | 'Delayed')
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Delayed">Delayed</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="edit-milestone-target-date"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Target Date <span className="text-destructive">*</span>
              </label>
              <input
                id="edit-milestone-target-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label
                htmlFor="edit-milestone-start-date"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Start Date (optional)
              </label>
              <input
                id="edit-milestone-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="edit-milestone-owner"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Owner (optional)
            </label>
            <input
              id="edit-milestone-owner"
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="Owner name"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Link/Unlink Tasks */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Link2 className="h-4 w-4" />
              Linked Tasks
            </label>
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks in this project yet.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto rounded-md border border-input bg-background p-2">
                {tasks.map((task) => (
                  <label
                    key={task.task_id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                  >
                    <input
                      type="checkbox"
                      checked={linkedTaskIds.includes(task.task_id)}
                      onChange={() => handleTaskToggle(task.task_id)}
                      className="h-4 w-4 rounded border-input"
                    />
                    <span className="flex-1 truncate text-foreground">{task.title}</span>
                    <span
                      className={`shrink-0 rounded-full px-1.5 py-0.5 text-xs ${
                        task.status === 'Done'
                          ? 'bg-green-500/10 text-green-500'
                          : task.status === 'In Progress'
                            ? 'bg-blue-500/10 text-blue-500'
                            : task.status === 'Blocked'
                              ? 'bg-red-500/10 text-red-500'
                              : 'bg-zinc-500/10 text-zinc-500'
                      }`}
                    >
                      {task.status}
                    </span>
                  </label>
                ))}
              </div>
            )}
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
