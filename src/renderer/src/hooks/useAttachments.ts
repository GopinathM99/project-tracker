import { useEffect } from 'react'
import { useAttachmentStore } from '@/stores/attachmentStore'
import { attachmentService } from '@/services/attachment-service'
import { useWorkspaceId } from './useWorkspace'

/**
 * Subscribe to attachments for a specific entity (Task, Bug, or Project).
 * Returns { attachments, loading } from the store.
 */
export function useAttachments(
  entityType: 'Task' | 'Bug' | 'Project',
  entityId: string,
) {
  const workspaceId = useWorkspaceId()
  const attachments = useAttachmentStore((s) => s.attachments)
  const loading = useAttachmentStore((s) => s.loading)
  const setAttachments = useAttachmentStore((s) => s.setAttachments)
  const setLoading = useAttachmentStore((s) => s.setLoading)
  const clear = useAttachmentStore((s) => s.clear)

  useEffect(() => {
    if (!workspaceId || !entityId) return

    setLoading(true)
    const unsubscribe = attachmentService.subscribeToEntityAttachments(
      workspaceId,
      entityType,
      entityId,
      (attachments) => {
        // Sort by uploaded_at descending (newest first)
        const sorted = [...attachments].sort(
          (a, b) =>
            new Date(b.uploaded_at).getTime() -
            new Date(a.uploaded_at).getTime(),
        )
        setAttachments(sorted)
        setLoading(false)
      },
    )

    return () => {
      unsubscribe()
      clear()
    }
  }, [workspaceId, entityType, entityId, setAttachments, setLoading, clear])

  return { attachments, loading }
}
