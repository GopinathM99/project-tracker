import { memo } from 'react'
import { Link } from 'react-router-dom'
import type { Bug } from '@shared/schemas'
import { CircleDot, Flag, AlertTriangle, Calendar, User } from 'lucide-react'
import { cn } from '@/lib/cn'

interface BugCardProps {
  bug: Bug
  projectId: string
  selected?: boolean
  onSelect?: () => void
}

function statusColor(status: string): string {
  switch (status) {
    case 'New':
      return 'bg-zinc-500/10 text-zinc-500'
    case 'Triaged':
      return 'bg-purple-500/10 text-purple-500'
    case 'In Progress':
      return 'bg-blue-500/10 text-blue-500'
    case 'Fixed':
      return 'bg-green-500/10 text-green-500'
    case 'Verified':
      return 'bg-emerald-500/10 text-emerald-500'
    case 'Closed':
      return 'bg-gray-500/10 text-gray-500'
    case 'Reopened':
      return 'bg-orange-500/10 text-orange-500'
    default:
      return 'bg-zinc-500/10 text-zinc-500'
  }
}

function severityColor(severity: string): string {
  switch (severity) {
    case 'Low':
      return 'bg-zinc-500/10 text-zinc-500'
    case 'Medium':
      return 'bg-yellow-500/10 text-yellow-500'
    case 'High':
      return 'bg-orange-500/10 text-orange-500'
    case 'Critical':
      return 'bg-red-500/10 text-red-500'
    default:
      return 'bg-zinc-500/10 text-zinc-500'
  }
}

function priorityColor(priority: string): string {
  switch (priority) {
    case 'Low':
      return 'bg-zinc-500/10 text-zinc-500'
    case 'Medium':
      return 'bg-yellow-500/10 text-yellow-500'
    case 'High':
      return 'bg-orange-500/10 text-orange-500'
    case 'Critical':
      return 'bg-red-500/10 text-red-500'
    default:
      return 'bg-zinc-500/10 text-zinc-500'
  }
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString()
}

function isOverdue(bug: Bug): boolean {
  if (!bug.target_fix_date) return false
  if (['Fixed', 'Verified', 'Closed'].includes(bug.status)) return false
  return new Date(bug.target_fix_date) < new Date()
}

export const BugCard = memo(function BugCard({ bug, projectId, selected, onSelect }: BugCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 transition-colors',
        selected && 'border-primary bg-primary/5',
      )}
    >
      {onSelect && (
        <input
          type="checkbox"
          checked={selected ?? false}
          onChange={(e) => {
            e.stopPropagation()
            onSelect()
          }}
          className="h-4 w-4 shrink-0 rounded border-input accent-primary cursor-pointer"
        />
      )}

      <Link
        to={`/projects/${projectId}/bugs/${bug.bug_id}`}
        className="flex flex-1 items-center gap-3 hover:opacity-80"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <h4 className="text-sm font-medium text-foreground truncate">{bug.title}</h4>
          {isOverdue(bug) && (
            <span className="shrink-0 text-xs font-medium text-red-500">Overdue</span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(bug.status)}`}
          >
            <CircleDot className="h-3 w-3" />
            {bug.status}
          </span>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${severityColor(bug.severity)}`}
          >
            <AlertTriangle className="h-3 w-3" />
            {bug.severity}
          </span>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${priorityColor(bug.priority)}`}
          >
            <Flag className="h-3 w-3" />
            {bug.priority}
          </span>

          {bug.target_fix_date && (
            <span
              className={`inline-flex items-center gap-1 text-xs ${isOverdue(bug) ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}
            >
              <Calendar className="h-3 w-3" />
              {formatDate(bug.target_fix_date)}
            </span>
          )}

          {bug.assignee && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              {bug.assignee}
            </span>
          )}
        </div>
      </Link>
    </div>
  )
})
