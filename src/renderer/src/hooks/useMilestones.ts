import { useEffect } from 'react'
import { milestoneService } from '@/services/milestone-service'
import { useMilestoneStore } from '@/stores/milestoneStore'
import { useWorkspaceId } from '@/hooks/useWorkspace'

/**
 * Subscribe to all milestones for a given project in the current workspace.
 * Returns { milestones, loading } from the store.
 */
export function useMilestones(projectId: string | undefined) {
  const workspaceId = useWorkspaceId()
  const milestones = useMilestoneStore((s) => s.milestones)
  const loading = useMilestoneStore((s) => s.loading)
  const setMilestones = useMilestoneStore((s) => s.setMilestones)
  const setLoading = useMilestoneStore((s) => s.setLoading)

  useEffect(() => {
    if (!workspaceId || !projectId) return

    setLoading(true)
    const unsubscribe = milestoneService.subscribeToProjectMilestones(
      workspaceId,
      projectId,
      (milestones) => {
        setMilestones(milestones)
        setLoading(false)
      },
    )

    return () => {
      unsubscribe()
      setMilestones([])
    }
  }, [workspaceId, projectId, setMilestones, setLoading])

  return { milestones, loading }
}
