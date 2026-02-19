import { useEffect } from 'react'
import { useFolderStore } from '@/stores/folderStore'
import { folderService } from '@/services/folder-service'
import { useWorkspaceId } from './useWorkspace'

/**
 * Subscribe to all folders in the current workspace.
 * Returns { folders, loading } from the store.
 */
export function useFolders() {
  const workspaceId = useWorkspaceId()
  const folders = useFolderStore((s) => s.folders)
  const loading = useFolderStore((s) => s.loading)
  const setFolders = useFolderStore((s) => s.setFolders)
  const setLoading = useFolderStore((s) => s.setLoading)

  useEffect(() => {
    if (!workspaceId) return

    setLoading(true)
    const unsubscribe = folderService.subscribeToFolders(workspaceId, (folders) => {
      setFolders(folders)
      setLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [workspaceId, setFolders, setLoading])

  return { folders, loading }
}
