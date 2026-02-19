import type { Task } from '@shared/schemas'

interface KanbanHeaderProps {
  tasks: Task[]
  scopeLabel: string
}

function isOverdue(task: Task): boolean {
  if (!task.due_date || task.status === 'Done') return false
  return new Date(task.due_date) < new Date()
}

export function KanbanHeader({ tasks, scopeLabel }: KanbanHeaderProps): JSX.Element {
  const total = tasks.length
  const doneCount = tasks.filter((t) => t.status === 'Done').length
  const blockedCount = tasks.filter((t) => t.status === 'Blocked').length
  const overdueCount = tasks.filter((t) => isOverdue(t)).length
  const donePercent = total > 0 ? Math.round((doneCount / total) * 100) : 0

  return (
    <div className="mb-4">
      <h1 className="mb-3 text-xl font-bold text-foreground">{scopeLabel}</h1>
      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-lg border border-border bg-card px-3 py-2 text-center">
          <p className="text-lg font-bold text-foreground">{total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-3 py-2 text-center">
          <p className="text-lg font-bold text-green-500">{donePercent}%</p>
          <p className="text-xs text-muted-foreground">Done</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-3 py-2 text-center">
          <p className="text-lg font-bold text-red-500">{blockedCount}</p>
          <p className="text-xs text-muted-foreground">Blocked</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-3 py-2 text-center">
          <p className="text-lg font-bold text-orange-500">{overdueCount}</p>
          <p className="text-xs text-muted-foreground">Overdue</p>
        </div>
      </div>
    </div>
  )
}
