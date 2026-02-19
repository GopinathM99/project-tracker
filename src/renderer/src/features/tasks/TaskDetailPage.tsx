import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { taskService } from '@/services/task-service'
import { AttachmentSection } from '@/features/attachments/AttachmentSection'
import { CommentSection } from '@/features/comments/CommentSection'
import { ActivityFeed } from '@/features/activity/ActivityFeed'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { useCanWrite } from '@/hooks/usePermission'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { EditTaskDialog } from './components/EditTaskDialog'
import { SubtaskSection } from './components/SubtaskSection'
import { DependencySection } from './components/DependencySection'
import { EntityLinkSection } from '@/features/entity-links/EntityLinkSection'
import type { Task } from '@shared/schemas'
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  CircleDot,
  Flag,
  Calendar,
  User,
  Clock,
  FolderOpen,
  ExternalLink,
} from 'lucide-react'

function statusColor(status: string): string {
  switch (status) {
    case 'Not Started':
      return 'bg-zinc-500/10 text-zinc-500'
    case 'In Progress':
      return 'bg-blue-500/10 text-blue-500'
    case 'Blocked':
      return 'bg-red-500/10 text-red-500'
    case 'Done':
      return 'bg-green-500/10 text-green-500'
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

function formatDate(isoString: string | null): string {
  if (!isoString) return '-'
  return new Date(isoString).toLocaleDateString()
}

function isOverdue(task: Task): boolean {
  if (!task.due_date || task.status === 'Done') return false
  return new Date(task.due_date) < new Date()
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  'Not Started': ['In Progress'],
  'In Progress': ['Blocked', 'Done'],
  Blocked: ['In Progress'],
  Done: ['In Progress'],
}

export default function TaskDetailPage(): JSX.Element {
  const { projectId, taskId } = useParams()
  const navigate = useNavigate()
  const workspaceId = useWorkspaceId()
  const canWrite = useCanWrite()

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!workspaceId || !taskId) return
    setLoading(true)
    taskService
      .getTask(workspaceId, taskId)
      .then(setTask)
      .catch(() => setError('Failed to load task'))
      .finally(() => setLoading(false))
  }, [workspaceId, taskId])

  async function handleDelete(): Promise<void> {
    if (!workspaceId || !task) return
    const confirmed = window.confirm(`Are you sure you want to delete "${task.title}"?`)
    if (!confirmed) return

    try {
      await taskService.deleteTask(workspaceId, task.task_id)
      navigate(`/projects/${projectId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }

  async function handleStatusChange(newStatus: string): Promise<void> {
    if (!workspaceId || !task) return

    try {
      await taskService.updateTask(workspaceId, task.task_id, {
        status: newStatus as Task['status'],
      })
      setTask({ ...task, status: newStatus as Task['status'] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    }
  }

  function handleEditClose(): void {
    setEditOpen(false)
    // Re-fetch the task to pick up changes
    if (workspaceId && taskId) {
      taskService.getTask(workspaceId, taskId).then(setTask)
    }
  }

  if (loading) {
    return <LoadingState />
  }

  if (error && !task) {
    return (
      <EmptyState
        title="Error"
        description={error}
        action={{ label: 'Go Back', onClick: () => navigate(`/projects/${projectId}`) }}
      />
    )
  }

  if (!task) {
    return (
      <EmptyState
        title="Task Not Found"
        description="The task you are looking for does not exist or has been deleted."
        action={{ label: 'Go Back', onClick: () => navigate(`/projects/${projectId}`) }}
      />
    )
  }

  const nextStatuses = STATUS_TRANSITIONS[task.status] ?? []

  return (
    <div className="mx-auto max-w-3xl p-6">
      {/* Back button */}
      <Link
        to={`/projects/${projectId}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Project
      </Link>

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Task header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-foreground">{task.title}</h1>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(task.status)}`}
            >
              <CircleDot className="h-3 w-3" />
              {task.status}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${priorityColor(task.priority)}`}
            >
              <Flag className="h-3 w-3" />
              {task.priority}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {canWrite && (
          <>
            <button
              onClick={() => setEditOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 rounded-md border border-destructive/50 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </>
        )}

        <button
          onClick={() =>
            window.electronAPI.openNewWindow(`/projects/${projectId}/tasks/${taskId}`)
          }
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          title="Open in New Window"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          New Window
        </button>

        {canWrite && nextStatuses.length > 0 && (
          <div className="ml-2 flex items-center gap-2 border-l border-border pl-4">
            <span className="text-xs text-muted-foreground">Move to:</span>
            {nextStatuses.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Metadata section */}
      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Owner:</span>
            <span className="text-foreground">{task.owner ?? 'Unassigned'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Project:</span>
            <Link
              to={`/projects/${projectId}`}
              className="text-primary hover:underline"
            >
              View Project
            </Link>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Start:</span>
            <span className="text-foreground">{formatDate(task.start_date)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Expected Completion:</span>
            <span className="text-foreground">{formatDate(task.expected_completion_date)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Due Date:</span>
            <span className={isOverdue(task) ? 'font-medium text-red-500' : 'text-foreground'}>
              {formatDate(task.due_date)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Created:</span>
            <span className="text-foreground">{formatDate(task.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Description section */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Description</h2>
        {task.description ? (
          <MarkdownRenderer content={task.description} />
        ) : (
          <p className="text-sm text-muted-foreground">No description provided.</p>
        )}
      </div>

      {/* Subtasks */}
      <SubtaskSection parentTask={task} projectId={projectId!} />

      {/* Dependencies */}
      <DependencySection task={task} projectId={projectId!} />

      {/* Entity Links */}
      <EntityLinkSection entityType="Task" entityId={task.task_id} projectId={projectId!} />

      {/* Attachments */}
      <div className="mt-6">
        <AttachmentSection entityType="Task" entityId={task.task_id} />
      </div>

      {/* Comments */}
      <div className="mt-6">
        <CommentSection entityType="Task" entityId={task.task_id} />
      </div>

      {/* Activity */}
      <div className="mt-6">
        <ActivityFeed workspaceId={workspaceId!} scope="entity" entityType="Task" entityId={task.task_id} />
      </div>

      {/* Edit dialog */}
      {editOpen && (
        <EditTaskDialog
          open={editOpen}
          onClose={handleEditClose}
          task={task}
        />
      )}
    </div>
  )
}
