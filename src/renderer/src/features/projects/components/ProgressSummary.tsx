import { AlertCircle, CheckCircle2, Target } from 'lucide-react'
import type { Task, Milestone } from '@shared/schemas'

interface ProgressSummaryProps {
  tasks: Task[]
  milestones: Milestone[]
}

function isOverdue(task: Task): boolean {
  if (!task.due_date || task.status === 'Done') return false
  return new Date(task.due_date) < new Date()
}

export function ProgressSummary({ tasks, milestones }: ProgressSummaryProps): JSX.Element {
  const totalTasks = tasks.length
  const doneTasks = tasks.filter((t) => t.status === 'Done').length
  const overdueCount = tasks.filter((t) => isOverdue(t)).length
  const taskPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  const totalMilestones = milestones.length
  const completedMilestones = milestones.filter((m) => m.status === 'Completed').length

  return (
    <div className="mb-6 rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Project Progress</h3>

      {/* Task progress */}
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            {doneTasks} of {totalTasks} tasks complete ({taskPercent}%)
          </span>
          {overdueCount > 0 && (
            <span className="flex items-center gap-1 text-sm font-medium text-red-500">
              <AlertCircle className="h-4 w-4" />
              {overdueCount} overdue
            </span>
          )}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-300"
            style={{ width: `${taskPercent}%` }}
          />
        </div>
      </div>

      {/* Milestone progress */}
      {totalMilestones > 0 && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Target className="h-4 w-4 text-blue-500" />
          {completedMilestones} of {totalMilestones} milestones complete
        </div>
      )}
    </div>
  )
}
