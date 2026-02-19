import { useEffect } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { projectService } from '@/services/project-service'
import { useWorkspaceId } from './useWorkspace'

/**
 * Subscribe to a single project. Sets it in the store as currentProject.
 */
export function useProject(projectId: string | undefined) {
  const workspaceId = useWorkspaceId()
  const currentProject = useProjectStore((s) => s.currentProject)
  const setCurrentProject = useProjectStore((s) => s.setCurrentProject)
  const loading = useProjectStore((s) => s.loading)
  const setLoading = useProjectStore((s) => s.setLoading)

  useEffect(() => {
    if (!workspaceId || !projectId) return

    setLoading(true)
    const unsubscribe = projectService.subscribeToProject(workspaceId, projectId, (project) => {
      setCurrentProject(project)
      setLoading(false)
    })

    return () => {
      unsubscribe()
      setCurrentProject(null)
    }
  }, [workspaceId, projectId, setCurrentProject, setLoading])

  return { project: currentProject, loading }
}
