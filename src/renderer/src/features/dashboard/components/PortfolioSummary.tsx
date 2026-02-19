import { FolderOpen, CheckCircle2, Loader, ShieldAlert, Clock, Bug } from 'lucide-react'
import type { Task, Bug as BugType } from '@shared/schemas'

interface PortfolioSummaryProps {
  activeProjectCount: number
  tasks: Task[]
  bugs: BugType[]
}

function isOverdue(task: Task): boolean {
  if (!task.due_date || task.status === 'Done') return false
  return new Date(task.due_date) < new Date()
}

function isOpenBug(bug: BugType): boolean {
  return !['Fixed', 'Verified', 'Closed'].includes(bug.status)
}

export function PortfolioSummary({
  activeProjectCount,
  tasks,
  bugs,
}: PortfolioSummaryProps): JSX.Element {
  const totalTasks = tasks.length
  const doneCount = tasks.filter((t) => t.status === 'Done').length
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length
  const blockedCount = tasks.filter((t) => t.status === 'Blocked').length
  const overdueCount = tasks.filter((t) => isOverdue(t)).length
  const openBugCount = bugs.filter((b) => isOpenBug(b)).length

  const stats = [
    {
      label: 'Active Projects',
      value: activeProjectCount,
      color: 'text-foreground',
      icon: FolderOpen,
    },
    { label: 'Total Tasks', value: totalTasks, color: 'text-foreground', icon: null },
    { label: 'Done', value: doneCount, color: 'text-green-500', icon: CheckCircle2 },
    { label: 'In Progress', value: inProgressCount, color: 'text-blue-500', icon: Loader },
    { label: 'Blocked', value: blockedCount, color: 'text-red-500', icon: ShieldAlert },
    { label: 'Overdue', value: overdueCount, color: 'text-orange-500', icon: Clock },
    { label: 'Open Bugs', value: openBugCount, color: 'text-purple-500', icon: Bug },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-border bg-card p-3 text-center"
        >
          {stat.icon && (
            <stat.icon className={`mx-auto mb-1 h-4 w-4 ${stat.color}`} />
          )}
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
