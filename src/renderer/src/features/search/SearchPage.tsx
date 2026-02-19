import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FolderKanban, CheckCircle, Bug } from 'lucide-react'
import { cn } from '@/lib/cn'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { useDashboard } from '@/hooks/useDashboard'
import { useSearchStore } from '@/stores/searchStore'
import { searchEntities } from '@/services/search-service'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import type { SearchResult } from '@/services/search-service'

const entityFilterOptions = [
  { value: 'all' as const, label: 'All' },
  { value: 'project' as const, label: 'Projects' },
  { value: 'task' as const, label: 'Tasks' },
  { value: 'bug' as const, label: 'Bugs' },
]

const statusOptions: Record<string, string[]> = {
  all: [],
  project: ['Active', 'On Hold', 'Completed', 'Archived'],
  task: ['Not Started', 'In Progress', 'Blocked', 'Done'],
  bug: ['New', 'Triaged', 'In Progress', 'Fixed', 'Verified', 'Closed', 'Reopened'],
}

function getStatusColor(type: string, status: string): string {
  if (type === 'project') {
    switch (status) {
      case 'Active':
        return 'bg-green-500/10 text-green-700 dark:text-green-400'
      case 'On Hold':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
      case 'Completed':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
      case 'Archived':
        return 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-400'
      default:
        return 'bg-zinc-500/10 text-zinc-600'
    }
  }

  if (type === 'task') {
    switch (status) {
      case 'Not Started':
        return 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-400'
      case 'In Progress':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
      case 'Blocked':
        return 'bg-red-500/10 text-red-700 dark:text-red-400'
      case 'Done':
        return 'bg-green-500/10 text-green-700 dark:text-green-400'
      default:
        return 'bg-zinc-500/10 text-zinc-600'
    }
  }

  // bug
  switch (status) {
    case 'New':
      return 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-400'
    case 'Triaged':
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
    case 'In Progress':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
    case 'Fixed':
    case 'Verified':
      return 'bg-green-500/10 text-green-700 dark:text-green-400'
    case 'Closed':
      return 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-400'
    case 'Reopened':
      return 'bg-orange-500/10 text-orange-700 dark:text-orange-400'
    default:
      return 'bg-zinc-500/10 text-zinc-600'
  }
}

function getEntityIcon(type: string): typeof FolderKanban {
  switch (type) {
    case 'project':
      return FolderKanban
    case 'task':
      return CheckCircle
    case 'bug':
      return Bug
    default:
      return FolderKanban
  }
}

function highlightMatch(text: string, query: string): JSX.Element {
  if (!query.trim()) return <>{text}</>

  const lowerText = text.toLowerCase()
  const lowerQuery = query.trim().toLowerCase()
  const index = lowerText.indexOf(lowerQuery)

  if (index === -1) return <>{text}</>

  const before = text.slice(0, index)
  const match = text.slice(index, index + query.trim().length)
  const after = text.slice(index + query.trim().length)

  return (
    <>
      {before}
      <mark className="rounded bg-yellow-200/60 px-0.5 dark:bg-yellow-500/30">{match}</mark>
      {after}
    </>
  )
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export default function SearchPage(): JSX.Element {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const { projects, allTasks, allBugs, loading } = useDashboard()

  const storeQuery = useSearchStore((s) => s.query)
  const setStoreQuery = useSearchStore((s) => s.setQuery)
  const entityFilter = useSearchStore((s) => s.entityFilter)
  const setEntityFilter = useSearchStore((s) => s.setEntityFilter)
  const statusFilter = useSearchStore((s) => s.statusFilter)
  const setStatusFilter = useSearchStore((s) => s.setStatusFilter)

  // Local input value for responsive typing; debounced value drives the search
  const [inputValue, setInputValue] = useState(storeQuery)
  const debouncedQuery = useDebouncedValue(inputValue, 150)

  // Sync debounced value back to store so other components stay in sync
  useEffect(() => {
    setStoreQuery(debouncedQuery)
  }, [debouncedQuery, setStoreQuery])

  // Alias for readability in the rest of the component
  const query = debouncedQuery

  // Build a project name lookup map
  const projectNameMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of projects) {
      map.set(p.project_id, p.name)
    }
    return map
  }, [projects])

  // Compute available status options based on entity filter
  const availableStatuses = useMemo(() => {
    if (entityFilter === 'all') {
      // Merge all status options, deduplicate
      const all = new Set<string>()
      for (const statuses of Object.values(statusOptions)) {
        for (const s of statuses) {
          all.add(s)
        }
      }
      return Array.from(all)
    }
    return statusOptions[entityFilter] || []
  }, [entityFilter])

  // Debounced search results
  const results = useMemo(
    () => searchEntities(projects, allTasks, allBugs, query, entityFilter, statusFilter),
    [projects, allTasks, allBugs, query, entityFilter, statusFilter]
  )

  // Autofocus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleResultClick = useCallback(
    (result: SearchResult) => {
      switch (result.type) {
        case 'project':
          navigate(`/projects/${result.projectId}`)
          break
        case 'task':
          navigate(`/projects/${result.projectId}/tasks/${result.id}`)
          break
        case 'bug':
          navigate(`/projects/${result.projectId}/bugs/${result.id}`)
          break
      }
    },
    [navigate]
  )

  const handleEntityFilterChange = useCallback(
    (filter: 'all' | 'project' | 'task' | 'bug') => {
      setEntityFilter(filter)
      // Reset status filter when entity filter changes, since statuses differ
      setStatusFilter(null)
    },
    [setEntityFilter, setStatusFilter]
  )

  if (loading) {
    return <LoadingState />
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search projects, tasks, and bugs..."
          aria-label="Search projects, tasks, and bugs"
          className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Entity filter pills */}
      <div className="mt-4 flex items-center gap-2">
        {entityFilterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleEntityFilterChange(option.value)}
            aria-pressed={entityFilter === option.value}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              entityFilter === option.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            {option.label}
          </button>
        ))}

        {/* Status filter dropdown */}
        {availableStatuses.length > 0 && (
          <select
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value || null)}
            aria-label="Filter by status"
            className="ml-auto rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All statuses</option>
            {availableStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Results */}
      <div className="mt-6">
        {query.trim() === '' ? (
          <EmptyState
            title="Search your workspace"
            description="Type a keyword to search across projects, tasks, and bugs."
          />
        ) : results.length === 0 ? (
          <EmptyState
            title="No results found"
            description={`No matches for "${query}". Try a different keyword or filter.`}
          />
        ) : (
          <>
            <p className="mb-3 text-xs text-muted-foreground" aria-live="polite">
              {results.length} result{results.length !== 1 ? 's' : ''}
              {results.length === 50 ? ' (showing max 50)' : ''}
            </p>
            <ul className="space-y-2">
              {results.map((result) => {
                const Icon = getEntityIcon(result.type)
                const projectName =
                  result.type !== 'project'
                    ? projectNameMap.get(result.projectId)
                    : undefined

                return (
                  <li key={`${result.type}-${result.id}`}>
                    <button
                      onClick={() => handleResultClick(result)}
                      className="flex w-full items-start gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent"
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-foreground">
                            {result.matchField === 'title'
                              ? highlightMatch(result.title, query)
                              : result.title}
                          </span>
                          <span
                            className={cn(
                              'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                              getStatusColor(result.type, result.status)
                            )}
                          >
                            {result.status}
                          </span>
                        </div>
                        {result.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {result.matchField === 'description'
                              ? highlightMatch(
                                  truncate(result.description, 120),
                                  query
                                )
                              : truncate(result.description, 120)}
                          </p>
                        )}
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {result.type}
                          </span>
                          {projectName && (
                            <>
                              <span className="text-[10px] text-muted-foreground">in</span>
                              <span className="text-[10px] font-medium text-muted-foreground">
                                {projectName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
