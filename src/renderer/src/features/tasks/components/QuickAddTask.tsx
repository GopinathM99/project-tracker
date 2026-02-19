import { useState, useRef } from 'react'
import { Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { taskService } from '@/services/task-service'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { generateTimestamp } from '@shared/utils'
import { addDays } from 'date-fns'

interface QuickAddTaskProps {
  projectId: string
  onCreated?: () => void
}

export function QuickAddTask({ projectId, onCreated }: QuickAddTaskProps): JSX.Element {
  const workspaceId = useWorkspaceId()
  const inputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium')
  const [owner, setOwner] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [creating, setCreating] = useState(false)

  async function handleCreate(): Promise<void> {
    if (!workspaceId || !title.trim() || creating) return

    setCreating(true)
    try {
      const now = new Date()
      const startDate = now.toISOString()
      const expectedCompletion = addDays(now, 7).toISOString()

      await taskService.createTask(workspaceId, {
        project_id: projectId,
        title: title.trim(),
        description: '',
        status: 'Not Started',
        priority,
        owner: owner.trim() || null,
        start_date: startDate,
        expected_completion_date: expectedCompletion,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        parent_task_id: null,
        recurrence_id: null,
        kanban_sort_order: null,
        tag_ids: [],
      })

      setTitle('')
      setPriority('Medium')
      setOwner('')
      setDueDate('')
      setExpanded(false)
      inputRef.current?.focus()
      onCreated?.()
    } catch {
      // Error could be surfaced via toast in the future
    } finally {
      setCreating(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter' && title.trim()) {
      e.preventDefault()
      handleCreate()
    }
    if (e.key === 'Escape') {
      inputRef.current?.blur()
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Quick add task... (Enter to create)"
          aria-label="Quick add task"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          disabled={creating}
          autoFocus
        />
        <button
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? 'Collapse options' : 'More options'}
          aria-expanded={expanded}
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          title={expanded ? 'Collapse' : 'More options'}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-3">
          <div className="flex items-center gap-1">
            <label className="text-xs text-muted-foreground">Priority:</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as typeof priority)}
              className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <label className="text-xs text-muted-foreground">Owner:</label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="Unassigned"
              className="w-28 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="flex items-center gap-1">
            <label className="text-xs text-muted-foreground">Due:</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={creating || !title.trim()}
            className="ml-auto rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      )}
    </div>
  )
}
