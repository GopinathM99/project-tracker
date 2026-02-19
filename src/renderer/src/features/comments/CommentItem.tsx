import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { commentService } from '@/services/comment-service'
import { renderMarkdown } from '@/lib/markdown'
import type { Comment } from '@shared/schemas'
import { Pencil, Trash2 } from 'lucide-react'

interface CommentItemProps {
  comment: Comment
}

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function CommentItem({ comment }: CommentItemProps): JSX.Element {
  const user = useAuthStore((s) => s.user)
  const workspaceId = useWorkspaceId()
  const isAuthor = user?.uid === comment.author_user_id

  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content_markdown)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSaveEdit(): Promise<void> {
    if (!workspaceId || !editContent.trim()) return

    setSaving(true)
    setError('')
    try {
      await commentService.updateComment(
        workspaceId,
        comment.comment_id,
        editContent.trim(),
      )
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update comment')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(): Promise<void> {
    if (!workspaceId) return
    const confirmed = window.confirm('Are you sure you want to delete this comment?')
    if (!confirmed) return

    try {
      await commentService.deleteComment(workspaceId, comment.comment_id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment')
    }
  }

  function handleCancelEdit(): void {
    setEditing(false)
    setEditContent(comment.content_markdown)
    setError('')
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {/* Header: author, timestamp, edited indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {comment.author_user_id}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(comment.created_at)}
          </span>
          {comment.is_edited && (
            <span className="text-xs text-muted-foreground">(edited)</span>
          )}
        </div>

        {/* Action buttons - only visible to the author */}
        {isAuthor && !editing && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground"
              title="Edit comment"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:text-destructive"
              title="Delete comment"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* Content or edit form */}
      {editing ? (
        <div className="mt-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            maxLength={5000}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px] resize-y"
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={saving || !editContent.trim()}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={saving}
              className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          className="mt-2 text-sm text-foreground prose-sm"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(comment.content_markdown) }}
        />
      )}
    </div>
  )
}
