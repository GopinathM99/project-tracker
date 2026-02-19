import { cn } from '@/lib/cn'
import { useKanbanStore, type KanbanFilters as KanbanFiltersType } from '@/stores/kanbanStore'
import { Filter, X } from 'lucide-react'
import type { Project } from '@shared/schemas'

interface KanbanFiltersProps {
  isMonthly?: boolean
  projects?: Project[]
}

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const

function priorityPillColor(priority: string, active: boolean): string {
  if (!active) return 'bg-muted text-muted-foreground hover:bg-muted/80'
  switch (priority) {
    case 'Low':
      return 'bg-zinc-500/20 text-zinc-400 ring-1 ring-zinc-500/40'
    case 'Medium':
      return 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/40'
    case 'High':
      return 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/40'
    case 'Critical':
      return 'bg-red-500/20 text-red-400 ring-1 ring-red-500/40'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export function KanbanFilters({ isMonthly, projects }: KanbanFiltersProps): JSX.Element {
  const filters = useKanbanStore((s) => s.filters)
  const setFilters = useKanbanStore((s) => s.setFilters)
  const clearFilters = useKanbanStore((s) => s.clearFilters)

  const hasActiveFilters =
    (filters.priority && filters.priority.length > 0) ||
    filters.owner !== undefined ||
    filters.projectId !== undefined ||
    (filters.dueDateWindow !== undefined && filters.dueDateWindow !== 'all')

  function togglePriority(priority: string): void {
    const current = filters.priority ?? []
    const next = current.includes(priority)
      ? current.filter((p) => p !== priority)
      : [...current, priority]
    setFilters({ priority: next })
  }

  function handleOwnerChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const value = e.target.value.trim()
    setFilters({ owner: value || undefined } as Partial<KanbanFiltersType>)
  }

  function handleProjectChange(e: React.ChangeEvent<HTMLSelectElement>): void {
    const value = e.target.value
    setFilters({ projectId: value || undefined })
  }

  function handleDueDateWindowChange(e: React.ChangeEvent<HTMLSelectElement>): void {
    setFilters({ dueDateWindow: (e.target.value as KanbanFiltersType['dueDateWindow']) || 'all' })
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>Filters</span>
      </div>

      {/* Priority pills */}
      <div className="flex items-center gap-1">
        {PRIORITIES.map((p) => {
          const active = filters.priority?.includes(p) ?? false
          return (
            <button
              key={p}
              onClick={() => togglePriority(p)}
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
                priorityPillColor(p, active)
              )}
            >
              {p}
            </button>
          )
        })}
      </div>

      {/* Owner filter */}
      <input
        type="text"
        placeholder="Filter by owner..."
        value={typeof filters.owner === 'string' ? filters.owner : ''}
        onChange={handleOwnerChange}
        className="h-7 w-36 rounded-md border border-border bg-background px-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />

      {/* Due date window */}
      <select
        value={filters.dueDateWindow ?? 'all'}
        onChange={handleDueDateWindowChange}
        className="h-7 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="all">All dates</option>
        <option value="this_week">This week</option>
        <option value="this_month">This month</option>
      </select>

      {/* Project filter (monthly scope only) */}
      {isMonthly && projects && projects.length > 0 && (
        <select
          value={filters.projectId ?? ''}
          onChange={handleProjectChange}
          className="h-7 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p.project_id} value={p.project_id}>
              {p.name}
            </option>
          ))}
        </select>
      )}

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}
    </div>
  )
}
