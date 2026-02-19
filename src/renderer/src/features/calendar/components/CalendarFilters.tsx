import { cn } from '@/lib/cn'
import { useCalendarStore } from '@/stores/calendarStore'
import { X } from 'lucide-react'
import type { Project } from '@shared/schemas'

const TASK_STATUSES = ['Not Started', 'In Progress', 'Blocked', 'Done'] as const

const statusColors: Record<string, string> = {
  'Not Started': 'bg-zinc-500/10 text-zinc-500 border-zinc-500/30',
  'In Progress': 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  Blocked: 'bg-red-500/10 text-red-500 border-red-500/30',
  Done: 'bg-green-500/10 text-green-500 border-green-500/30',
}

const statusActiveColors: Record<string, string> = {
  'Not Started': 'bg-zinc-500 text-white border-zinc-500',
  'In Progress': 'bg-blue-500 text-white border-blue-500',
  Blocked: 'bg-red-500 text-white border-red-500',
  Done: 'bg-green-500 text-white border-green-500',
}

interface CalendarFiltersProps {
  projects: Project[]
}

export function CalendarFilters({ projects }: CalendarFiltersProps): JSX.Element {
  const projectFilter = useCalendarStore((s) => s.projectFilter)
  const setProjectFilter = useCalendarStore((s) => s.setProjectFilter)
  const statusFilter = useCalendarStore((s) => s.statusFilter)
  const setStatusFilter = useCalendarStore((s) => s.setStatusFilter)
  const ownerFilter = useCalendarStore((s) => s.ownerFilter)
  const setOwnerFilter = useCalendarStore((s) => s.setOwnerFilter)
  const clearFilters = useCalendarStore((s) => s.clearFilters)

  const hasFilters = projectFilter !== null || statusFilter.length > 0 || ownerFilter !== ''

  function toggleStatus(status: string): void {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter((s) => s !== status))
    } else {
      setStatusFilter([...statusFilter, status])
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border pb-3">
      {/* Project dropdown */}
      <select
        value={projectFilter ?? ''}
        onChange={(e) => setProjectFilter(e.target.value || null)}
        className="h-8 rounded-md border border-border bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="">All Projects</option>
        {projects.map((p) => (
          <option key={p.project_id} value={p.project_id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Status pills */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Status:</span>
        {TASK_STATUSES.map((status) => {
          const isActive = statusFilter.includes(status)
          return (
            <button
              key={status}
              onClick={() => toggleStatus(status)}
              className={cn(
                'rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
                isActive ? statusActiveColors[status] : statusColors[status],
                'hover:opacity-80'
              )}
            >
              {status}
            </button>
          )
        })}
      </div>

      {/* Owner text input */}
      <input
        type="text"
        placeholder="Filter by owner..."
        value={ownerFilter}
        onChange={(e) => setOwnerFilter(e.target.value)}
        className="h-8 w-40 rounded-md border border-border bg-background px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-3 w-3" />
          Clear filters
        </button>
      )}
    </div>
  )
}
