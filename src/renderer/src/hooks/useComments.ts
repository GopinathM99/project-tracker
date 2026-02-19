import { useEffect } from 'react'
import { useCommentStore } from '@/stores/commentStore'
import { commentService } from '@/services/comment-service'
import { useWorkspaceId } from './useWorkspace'

/**
 * Subscribe to comments for a specific entity (Task, Bug, or Project).
 * Returns { comments, loading } from the store.
 */
export function useComments(
  entityType: 'Task' | 'Bug' | 'Project',
  entityId: string,
) {
  const workspaceId = useWorkspaceId()
  const comments = useCommentStore((s) => s.comments)
  const loading = useCommentStore((s) => s.loading)
  const setComments = useCommentStore((s) => s.setComments)
  const setLoading = useCommentStore((s) => s.setLoading)
  const clear = useCommentStore((s) => s.clear)

  useEffect(() => {
    if (!workspaceId || !entityId) return

    setLoading(true)
    const unsubscribe = commentService.subscribeToEntityComments(
      workspaceId,
      entityType,
      entityId,
      (comments) => {
        // Sort by created_at ascending (oldest first)
        const sorted = [...comments].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        )
        setComments(sorted)
        setLoading(false)
      },
    )

    return () => {
      unsubscribe()
      clear()
    }
  }, [workspaceId, entityType, entityId, setComments, setLoading, clear])

  return { comments, loading }
}
