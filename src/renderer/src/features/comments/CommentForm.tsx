import { useState } from 'react'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { commentService } from '@/services/comment-service'
import { Send } from 'lucide-react'

interface CommentFormProps {
  entityType: 'Task' | 'Bug' | 'Project'
  entityId: string
}

export function CommentForm({ entityType, entityId }: CommentFormProps): JSX.Element {
  const workspaceId = useWorkspaceId()
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!workspaceId || !content.trim()) return

    setSubmitting(true)
    setError('')
    try {
      await commentService.createComment(
        workspaceId,
        entityType,
        entityId,
        content.trim(),
      )
      setContent('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        maxLength={5000}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px] resize-y"
      />

      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Supports Markdown</p>
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  )
}
