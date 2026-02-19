import { useState } from 'react'
import { X, ChevronDown, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { FIELD_LIMITS } from '@shared/constants/validation'

interface BulkActionsBarProps {
  selectedCount: number
  entityType: 'task' | 'bug'
  onStatusChange: (status: string) => void
  onPriorityChange: (priority: string) => void
  onOwnerChange: (owner: string) => void
  onDelete: () => void
  onClearSelection: () => void
}

const TASK_STATUSES = ['Not Started', 'In Progress', 'Blocked', 'Done']
const BUG_STATUSES = ['New', 'Triaged', 'In Progress', 'Fixed', 'Verified', 'Closed']
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

export function BulkActionsBar({
  selectedCount,
  entityType,
  onStatusChange,
  onPriorityChange,
  onOwnerChange,
  onDelete,
  onClearSelection,
}: BulkActionsBarProps): JSX.Element | null {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)
  const [showOwnerInput, setShowOwnerInput] = useState(false)
  const [ownerValue, setOwnerValue] = useState('')

  if (selectedCount === 0) return null

  const exceedsLimit = selectedCount > FIELD_LIMITS.BULK_ACTION_MAX
  const statuses = entityType === 'task' ? TASK_STATUSES : BUG_STATUSES

  function handleOwnerSubmit(): void {
    if (ownerValue.trim()) {
      onOwnerChange(ownerValue.trim())
      setOwnerValue('')
      setShowOwnerInput(false)
    }
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
      {/* Left: selection info */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">
          {selectedCount} selected
        </span>
        {exceedsLimit && (
          <span className="text-xs font-medium text-destructive">
            (max {FIELD_LIMITS.BULK_ACTION_MAX})
          </span>
        )}
        <button
          onClick={onClearSelection}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-2">
        {/* Status dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowStatusDropdown(!showStatusDropdown)
              setShowPriorityDropdown(false)
              setShowOwnerInput(false)
            }}
            disabled={exceedsLimit}
            className={cn(
              'inline-flex items-center gap-1 rounded-md border border-input px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent',
              exceedsLimit && 'opacity-50 cursor-not-allowed',
            )}
          >
            Set Status
            <ChevronDown className="h-3 w-3" />
          </button>
          {showStatusDropdown && (
            <div className="absolute bottom-full left-0 mb-1 w-40 rounded-md border border-border bg-card py-1 shadow-lg">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    onStatusChange(status)
                    setShowStatusDropdown(false)
                  }}
                  className="block w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-accent"
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Priority dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowPriorityDropdown(!showPriorityDropdown)
              setShowStatusDropdown(false)
              setShowOwnerInput(false)
            }}
            disabled={exceedsLimit}
            className={cn(
              'inline-flex items-center gap-1 rounded-md border border-input px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent',
              exceedsLimit && 'opacity-50 cursor-not-allowed',
            )}
          >
            Set Priority
            <ChevronDown className="h-3 w-3" />
          </button>
          {showPriorityDropdown && (
            <div className="absolute bottom-full left-0 mb-1 w-32 rounded-md border border-border bg-card py-1 shadow-lg">
              {PRIORITIES.map((priority) => (
                <button
                  key={priority}
                  onClick={() => {
                    onPriorityChange(priority)
                    setShowPriorityDropdown(false)
                  }}
                  className="block w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-accent"
                >
                  {priority}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Owner input */}
        <div className="relative">
          <button
            onClick={() => {
              setShowOwnerInput(!showOwnerInput)
              setShowStatusDropdown(false)
              setShowPriorityDropdown(false)
            }}
            disabled={exceedsLimit}
            className={cn(
              'inline-flex items-center gap-1 rounded-md border border-input px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent',
              exceedsLimit && 'opacity-50 cursor-not-allowed',
            )}
          >
            Set Owner
          </button>
          {showOwnerInput && (
            <div className="absolute bottom-full left-0 mb-1 flex items-center gap-1 rounded-md border border-border bg-card p-2 shadow-lg">
              <input
                type="text"
                value={ownerValue}
                onChange={(e) => setOwnerValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleOwnerSubmit()
                  if (e.key === 'Escape') setShowOwnerInput(false)
                }}
                placeholder="Owner name"
                className="w-32 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                autoFocus
              />
              <button
                onClick={handleOwnerSubmit}
                className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Delete button */}
        <button
          onClick={onDelete}
          disabled={exceedsLimit}
          className={cn(
            'inline-flex items-center gap-1 rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90',
            exceedsLimit && 'opacity-50 cursor-not-allowed',
          )}
        >
          <Trash2 className="h-3 w-3" />
          Delete
        </button>
      </div>
    </div>
  )
}
