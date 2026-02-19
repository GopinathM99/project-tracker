import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { recurringTaskService } from '@/services/recurring-task-service'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import type { Task } from '@shared/schemas'

interface CreateRecurrenceDialogProps {
  open: boolean
  onClose: () => void
  projectId: string
  tasks: Task[]
  onCreated?: () => void
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
]

export function CreateRecurrenceDialog({
  open,
  onClose,
  projectId,
  tasks,
  onCreated,
}: CreateRecurrenceDialogProps): JSX.Element | null {
  const workspaceId = useWorkspaceId()

  const [templateTaskId, setTemplateTaskId] = useState('')
  const [intervalType, setIntervalType] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Custom'>('Daily')
  const [intervalValue, setIntervalValue] = useState(1)
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([])
  const [dayOfMonth, setDayOfMonth] = useState<number | ''>('')
  const [endType, setEndType] = useState<'Never' | 'AfterCount' | 'OnDate'>('Never')
  const [endAfterCount, setEndAfterCount] = useState<number | ''>(10)
  const [endOnDate, setEndOnDate] = useState('')
  const [startDate, setStartDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().slice(0, 10)
  })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  function toggleDay(day: number): void {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    )
  }

  async function handleCreate(): Promise<void> {
    if (!workspaceId || !templateTaskId || !startDate) {
      setError('Please fill in all required fields.')
      return
    }

    if (intervalValue < 1) {
      setError('Interval value must be at least 1.')
      return
    }

    setCreating(true)
    setError(null)

    try {
      const nextGenDate = new Date(startDate)
      nextGenDate.setHours(0, 0, 0, 0)

      await recurringTaskService.createRecurrence(workspaceId, {
        project_id: projectId,
        template_task_id: templateTaskId,
        interval_type: intervalType,
        interval_value: intervalValue,
        days_of_week: intervalType === 'Weekly' && daysOfWeek.length > 0 ? daysOfWeek : null,
        day_of_month: intervalType === 'Monthly' && dayOfMonth !== '' ? Number(dayOfMonth) : null,
        end_type: endType,
        end_after_count: endType === 'AfterCount' && endAfterCount !== '' ? Number(endAfterCount) : null,
        end_on_date: endType === 'OnDate' && endOnDate ? new Date(endOnDate).toISOString() : null,
        next_generation_date: nextGenDate.toISOString(),
        is_active: true,
      })

      onCreated?.()
      onClose()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create recurrence'
      setError(message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Create Recurrence</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Template task */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Template Task</label>
            <select
              value={templateTaskId}
              onChange={(e) => setTemplateTaskId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select a task...</option>
              {tasks.map((task) => (
                <option key={task.task_id} value={task.task_id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>

          {/* Interval type */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Interval Type</label>
            <select
              value={intervalType}
              onChange={(e) => setIntervalType(e.target.value as typeof intervalType)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Custom">Custom (days)</option>
            </select>
          </div>

          {/* Interval value */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Every {intervalValue} {intervalType === 'Daily' || intervalType === 'Custom' ? 'day(s)' : intervalType === 'Weekly' ? 'week(s)' : 'month(s)'}
            </label>
            <input
              type="number"
              min={1}
              value={intervalValue}
              onChange={(e) => setIntervalValue(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Weekly: day checkboxes */}
          {intervalType === 'Weekly' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Days of Week</label>
              <div className="flex gap-1">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      'rounded-md px-2 py-1 text-xs font-medium transition-colors',
                      daysOfWeek.includes(day.value)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Monthly: day of month */}
          {intervalType === 'Monthly' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Day of Month</label>
              <input
                type="number"
                min={1}
                max={31}
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value === '' ? '' : Math.min(31, Math.max(1, Number(e.target.value))))}
                placeholder="e.g. 15"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          {/* End type */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">End Condition</label>
            <select
              value={endType}
              onChange={(e) => setEndType(e.target.value as typeof endType)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Never">Never</option>
              <option value="AfterCount">After N occurrences</option>
              <option value="OnDate">On a specific date</option>
            </select>
          </div>

          {endType === 'AfterCount' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Number of occurrences</label>
              <input
                type="number"
                min={1}
                value={endAfterCount}
                onChange={(e) => setEndAfterCount(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          {endType === 'OnDate' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">End Date</label>
              <input
                type="date"
                value={endOnDate}
                onChange={(e) => setEndOnDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          {/* Start date (next_generation_date) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">First Generation Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !templateTaskId}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
