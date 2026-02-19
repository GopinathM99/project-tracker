import { useEffect } from 'react'
import { useTagStore } from '@/stores/tagStore'
import { tagService } from '@/services/tag-service'
import { useWorkspaceId } from './useWorkspace'

/**
 * Subscribe to all tags in the current workspace.
 * Returns { tags, loading } from the store.
 */
export function useTags() {
  const workspaceId = useWorkspaceId()
  const tags = useTagStore((s) => s.tags)
  const loading = useTagStore((s) => s.loading)
  const setTags = useTagStore((s) => s.setTags)
  const setLoading = useTagStore((s) => s.setLoading)

  useEffect(() => {
    if (!workspaceId) return

    setLoading(true)
    const unsubscribe = tagService.subscribeToTags(workspaceId, (tags) => {
      setTags(tags)
      setLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [workspaceId, setTags, setLoading])

  return { tags, loading }
}
