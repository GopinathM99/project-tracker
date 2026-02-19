import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { bugService } from '@/services/bug-service'
import { CommentSection } from '@/features/comments/CommentSection'
import { ActivityFeed } from '@/features/activity/ActivityFeed'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { useCanWrite } from '@/hooks/usePermission'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { EditBugDialog } from './components/EditBugDialog'
import { EntityLinkSection } from '@/features/entity-links/EntityLinkSection'
import type { Bug } from '@shared/schemas'
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  CircleDot,
  Flag,
  AlertTriangle,
  Calendar,
  User,
  Clock,
  FolderOpen,
} from 'lucide-react'

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

function formatDate(isoString: string | null): string {
  if (!isoString) return '-'
  return new Date(isoString).toLocaleDateString()
}

function isOverdue(bug: Bug): boolean {
  if (!bug.target_fix_date) return false
  if (['Fixed', 'Verified', 'Closed'].includes(bug.status)) return false
  return new Date(bug.target_fix_date) < new Date()
}

const BUG_STATUS_TRANSITIONS: Record<string, string[]> = {
  'New': ['Triaged'],
  'Triaged': ['In Progress'],
  'In Progress': ['Fixed'],
  'Fixed': ['Verified', 'Reopened'],
  'Verified': ['Closed', 'Reopened'],
  'Closed': ['Reopened'],
  'Reopened': ['In Progress'],
}

export default function BugDetailPage(): JSX.Element {
  const { projectId, bugId } = useParams()
  const navigate = useNavigate()
  const workspaceId = useWorkspaceId()
  const canWrite = useCanWrite()

  const [bug, setBug] = useState<Bug | null>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!workspaceId || !bugId) return
    setLoading(true)
    bugService
      .getBug(workspaceId, bugId)
      .then(setBug)
      .catch(() => setError('Failed to load bug'))
      .finally(() => setLoading(false))
  }, [workspaceId, bugId])

  async function handleDelete(): Promise<void> {
    if (!workspaceId || !bug) return
    const confirmed = window.confirm(`Are you sure you want to delete "${bug.title}"?`)
    if (!confirmed) return

    try {
      await bugService.deleteBug(workspaceId, bug.bug_id)
      navigate(`/projects/${projectId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bug')
    }
  }

  async function handleStatusChange(newStatus: string): Promise<void> {
    if (!workspaceId || !bug) return

    try {
      await bugService.updateBug(workspaceId, bug.bug_id, {
        status: newStatus as Bug['status'],
      })
      // Re-fetch to pick up any auto-set resolved_at
      const updated = await bugService.getBug(workspaceId, bug.bug_id)
      if (updated) setBug(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    }
  }

  function handleEditClose(): void {
    setEditOpen(false)
    // Re-fetch the bug to pick up changes
    if (workspaceId && bugId) {
      bugService.getBug(workspaceId, bugId).then(setBug)
    }
  }

  if (loading) {
    return <LoadingState />
  }

  if (error && !bug) {
    return (
      <EmptyState
        title="Error"
        description={error}
        action={{ label: 'Go Back', onClick: () => navigate(`/projects/${projectId}`) }}
      />
    )
  }

  if (!bug) {
    return (
      <EmptyState
        title="Bug Not Found"
        description="The bug you are looking for does not exist or has been deleted."
        action={{ label: 'Go Back', onClick: () => navigate(`/projects/${projectId}`) }}
      />
    )
  }

  const nextStatuses = BUG_STATUS_TRANSITIONS[bug.status] ?? []

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

      {/* Bug header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-foreground">{bug.title}</h1>
            {isOverdue(bug) && (
              <span className="mt-1 inline-block text-xs font-medium text-red-500">
                Overdue - target fix date has passed
              </span>
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
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {canWrite && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
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

          {nextStatuses.length > 0 && (
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
      )}

      {/* Metadata section */}
      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Reporter:</span>
            <span className="text-foreground">{bug.reporter}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Assignee:</span>
            <span className="text-foreground">{bug.assignee ?? 'Unassigned'}</span>
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
            <span className="text-muted-foreground">Reported:</span>
            <span className="text-foreground">{formatDate(bug.reported_at)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Target Fix:</span>
            <span className={isOverdue(bug) ? 'font-medium text-red-500' : 'text-foreground'}>
              {formatDate(bug.target_fix_date)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Resolved:</span>
            <span className="text-foreground">{formatDate(bug.resolved_at)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Created:</span>
            <span className="text-foreground">{formatDate(bug.created_at)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Updated:</span>
            <span className="text-foreground">{formatDate(bug.updated_at)}</span>
          </div>
        </div>
      </div>

      {/* Environment section */}
      {bug.environment && (
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Environment</h2>
          <p className="whitespace-pre-wrap text-sm text-foreground">{bug.environment}</p>
        </div>
      )}

      {/* Description section */}
      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Description</h2>
        {bug.description ? (
          <MarkdownRenderer content={bug.description} />
        ) : (
          <p className="text-sm text-muted-foreground">No description provided.</p>
        )}
      </div>

      {/* Steps to Reproduce section */}
      {bug.steps_to_reproduce && (
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Steps to Reproduce</h2>
          <MarkdownRenderer content={bug.steps_to_reproduce} />
        </div>
      )}

      {/* Expected vs Actual Result */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Expected Result</h2>
          {bug.expected_result ? (
            <MarkdownRenderer content={bug.expected_result} />
          ) : (
            <p className="text-sm text-muted-foreground">Not specified.</p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Actual Result</h2>
          {bug.actual_result ? (
            <MarkdownRenderer content={bug.actual_result} />
          ) : (
            <p className="text-sm text-muted-foreground">Not specified.</p>
          )}
        </div>
      </div>

      {/* Entity Links */}
      <EntityLinkSection entityType="Bug" entityId={bug.bug_id} projectId={projectId!} />

      {/* Comments */}
      <div className="mt-6">
        <CommentSection entityType="Bug" entityId={bug.bug_id} />
      </div>

      {/* Activity */}
      <div className="mt-6">
        <ActivityFeed workspaceId={workspaceId!} scope="entity" entityType="Bug" entityId={bug.bug_id} />
      </div>

      {/* Edit dialog */}
      {editOpen && (
        <EditBugDialog
          open={editOpen}
          onClose={handleEditClose}
          bug={bug}
        />
      )}
    </div>
  )
}
