import { Bug } from 'lucide-react'
import type { Bug as BugType } from '@shared/schemas'

interface BugSummaryProps {
  bugs: BugType[]
}

function isOpenBug(bug: BugType): boolean {
  return !['Fixed', 'Verified', 'Closed'].includes(bug.status)
}

export function BugSummary({ bugs }: BugSummaryProps): JSX.Element {
  const openBugs = bugs.filter((b) => isOpenBug(b))
  const totalOpen = openBugs.length

  // Severity breakdown (open bugs only)
  const criticalCount = openBugs.filter((b) => b.severity === 'Critical').length
  const highCount = openBugs.filter((b) => b.severity === 'High').length
  const mediumCount = openBugs.filter((b) => b.severity === 'Medium').length
  const lowCount = openBugs.filter((b) => b.severity === 'Low').length

  // Unassigned bugs (open only)
  const unassignedCount = openBugs.filter((b) => !b.assignee).length

  // Overdue bugs (target_fix_date passed, still open)
  const now = new Date()
  const overdueCount = openBugs.filter((b) => {
    if (!b.target_fix_date) return false
    return new Date(b.target_fix_date) < now
  }).length

  const maxSeverity = Math.max(criticalCount, highCount, mediumCount, lowCount, 1)

  const severityBars = [
    { label: 'Critical', value: criticalCount, color: 'bg-red-500' },
    { label: 'High', value: highCount, color: 'bg-orange-500' },
    { label: 'Medium', value: mediumCount, color: 'bg-yellow-500' },
    { label: 'Low', value: lowCount, color: 'bg-zinc-400' },
  ]

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Bug className="h-4 w-4 text-purple-500" />
        <h2 className="text-lg font-semibold text-foreground">Bug Summary</h2>
      </div>

      {/* Top stats */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-md bg-purple-500/10 p-2 text-center">
          <p className="text-xl font-bold text-purple-500">{totalOpen}</p>
          <p className="text-xs text-muted-foreground">Open Bugs</p>
        </div>
        <div className="rounded-md bg-orange-500/10 p-2 text-center">
          <p className="text-xl font-bold text-orange-500">{overdueCount}</p>
          <p className="text-xs text-muted-foreground">Overdue</p>
        </div>
        <div className="rounded-md bg-zinc-500/10 p-2 text-center">
          <p className="text-xl font-bold text-zinc-500">{unassignedCount}</p>
          <p className="text-xs text-muted-foreground">Unassigned</p>
        </div>
      </div>

      {/* Severity breakdown */}
      <p className="mb-2 text-xs font-medium text-muted-foreground">By Severity</p>
      <div className="space-y-2">
        {severityBars.map((bar) => (
          <div key={bar.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{bar.label}</span>
              <span className="font-medium text-foreground">{bar.value}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${bar.color} transition-all duration-300`}
                style={{ width: `${maxSeverity > 0 ? (bar.value / maxSeverity) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
