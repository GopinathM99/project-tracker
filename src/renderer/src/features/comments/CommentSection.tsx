import { useComments } from '@/hooks/useComments'
import { CommentItem } from './CommentItem'
import { CommentForm } from './CommentForm'
import { MessageSquare } from 'lucide-react'

interface CommentSectionProps {
  entityType: 'Task' | 'Bug' | 'Project'
  entityId: string
}

export function CommentSection({
  entityType,
  entityId,
}: CommentSectionProps): JSX.Element {
  const { comments, loading } = useComments(entityType, entityId)

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">
          Comments{comments.length > 0 ? ` (${comments.length})` : ''}
        </h2>
      </div>

      {/* Comment list */}
      {loading ? (
        <div className="py-4 text-center">
          <p className="text-sm text-muted-foreground">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-sm text-muted-foreground">
            No comments yet. Be the first to comment.
          </p>
        </div>
      ) : (
        <div className="mb-4 space-y-3">
          {comments.map((comment) => (
            <CommentItem key={comment.comment_id} comment={comment} />
          ))}
        </div>
      )}

      {/* New comment form */}
      <CommentForm entityType={entityType} entityId={entityId} />
    </div>
  )
}
