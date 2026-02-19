import type { Bug } from '@shared/schemas'
import { BugCard } from './BugCard'
import { useBulkActions } from '@/hooks/useBulkActions'
import { usePagination } from '@/hooks/usePagination'
import { BulkActionsBar } from '@/features/bulk-actions/BulkActionsBar'
import { bulkActionService } from '@/services/bulk-action-service'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface BugListProps {
  bugs: Bug[]
  projectId: string
}

export function BugList({ bugs, projectId }: BugListProps): JSX.Element {
  const workspaceId = useWorkspaceId()
  const {
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    isSelected,
    selectedCount,
  } = useBulkActions<Bug>(bugs, 'bug_id')

  const { page, totalPages, paginatedItems, goToPage, nextPage, prevPage } =
    usePagination(bugs, 50)

  if (bugs.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No bugs match the current filters.
      </p>
    )
  }

  async function handleStatusChange(status: string): Promise<void> {
    if (!workspaceId) return
    const ids = Array.from(selectedIds)
    await bulkActionService.bulkUpdateBugs(workspaceId, ids, { status: status as Bug['status'] })
    clearSelection()
  }

  async function handlePriorityChange(priority: string): Promise<void> {
    if (!workspaceId) return
    const ids = Array.from(selectedIds)
    await bulkActionService.bulkUpdateBugs(workspaceId, ids, { priority: priority as Bug['priority'] })
    clearSelection()
  }

  async function handleOwnerChange(owner: string): Promise<void> {
    if (!workspaceId) return
    const ids = Array.from(selectedIds)
    await bulkActionService.bulkUpdateBugs(workspaceId, ids, { assignee: owner })
    clearSelection()
  }

  async function handleDelete(): Promise<void> {
    if (!workspaceId) return
    const ids = Array.from(selectedIds)
    await bulkActionService.bulkDeleteBugs(workspaceId, ids)
    clearSelection()
  }

  return (
    <div>
      {/* Select All header */}
      <div className="mb-2 flex items-center gap-2">
        <input
          type="checkbox"
          checked={selectedCount > 0 && selectedCount === bugs.length}
          onChange={() => {
            if (selectedCount === bugs.length) {
              clearSelection()
            } else {
              selectAll()
            }
          }}
          className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
        />
        <span className="text-xs text-muted-foreground">
          {selectedCount > 0 ? `${selectedCount} selected` : 'Select all'}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {paginatedItems.map((bug) => (
          <BugCard
            key={bug.bug_id}
            bug={bug}
            projectId={projectId}
            selected={isSelected(bug.bug_id)}
            onSelect={() => toggleSelect(bug.bug_id)}
          />
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={prevPage}
            disabled={page === 1}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Bulk actions bar */}
      <BulkActionsBar
        selectedCount={selectedCount}
        entityType="bug"
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
        onOwnerChange={handleOwnerChange}
        onDelete={handleDelete}
        onClearSelection={clearSelection}
      />
    </div>
  )
}
