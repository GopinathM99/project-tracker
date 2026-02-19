import { useEffect } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { projectService } from '@/services/project-service'
import { useWorkspaceId } from './useWorkspace'

/**
 * Subscribe to all projects in the current workspace.
 * Returns { projects, loading } from the store.
 */
export function useProjects() {
  const workspaceId = useWorkspaceId()
  const projects = useProjectStore((s) => s.projects)
  const loading = useProjectStore((s) => s.loading)
  const setProjects = useProjectStore((s) => s.setProjects)
  const setLoading = useProjectStore((s) => s.setLoading)

  useEffect(() => {
    if (!workspaceId) return

    setLoading(true)
    const unsubscribe = projectService.subscribeToProjects(workspaceId, (projects) => {
      setProjects(projects)
      setLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [workspaceId, setProjects, setLoading])

  return { projects, loading }
}
