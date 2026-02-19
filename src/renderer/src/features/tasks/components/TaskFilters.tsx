import { useTaskStore } from '@/stores/taskStore'
import { Search } from 'lucide-react'

const TASK_STATUSES = ['Not Started', 'In Progress', 'Blocked', 'Done'] as const
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const

export function TaskFilters(): JSX.Element {
  const filters = useTaskStore((s) => s.filters)
  const setFilters = useTaskStore((s) => s.setFilters)

  function handleSearchChange(value: string): void {
    setFilters({ ...filters, search: value || undefined })
  }

  function toggleStatus(status: string): void {
    const current = filters.status ?? []
    const next = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status]
    setFilters({ ...filters, status: next.length > 0 ? next : undefined })
  }

  function togglePriority(priority: string): void {
    const current = filters.priority ?? []
    const next = current.includes(priority)
      ? current.filter((p) => p !== priority)
      : [...current, priority]
    setFilters({ ...filters, priority: next.length > 0 ? next : undefined })
  }

  function clearFilters(): void {
    setFilters({})
  }

  const hasActiveFilters =
    (filters.status && filters.status.length > 0) ||
    (filters.priority && filters.priority.length > 0) ||
    !!filters.search

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={filters.search ?? ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Status:</span>
        {TASK_STATUSES.map((status) => {
          const active = filters.status?.includes(status) ?? false
          return (
            <button
              key={status}
              onClick={() => toggleStatus(status)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-muted-foreground hover:text-foreground'
              }`}
            >
              {status}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Priority:</span>
        {PRIORITIES.map((priority) => {
          const active = filters.priority?.includes(priority) ?? false
          return (
            <button
              key={priority}
              onClick={() => togglePriority(priority)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-muted-foreground hover:text-foreground'
              }`}
            >
              {priority}
            </button>
          )
        })}
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="text-xs text-primary hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  )
}
