import { useEffect, useState } from 'react'
import { useDependencyStore } from '@/stores/dependencyStore'
import { dependencyService } from '@/services/dependency-service'
import { useWorkspaceId } from './useWorkspace'
import type { DependencyLink } from '@shared/schemas'

/**
 * Subscribe to all dependencies for the current workspace.
 * Returns { dependencies, loading }
 */
export function useDependencies(): { dependencies: DependencyLink[]; loading: boolean } {
  const workspaceId = useWorkspaceId()
  const dependencies = useDependencyStore((s) => s.dependencies)
  const setDependencies = useDependencyStore((s) => s.setDependencies)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!workspaceId) return

    setLoading(true)
    const unsubscribe = dependencyService.subscribeToWorkspaceDependencies(
      workspaceId,
      (deps) => {
        setDependencies(deps)
        setLoading(false)
      },
    )

    return () => {
      unsubscribe()
      setDependencies([])
    }
  }, [workspaceId, setDependencies])

  return { dependencies, loading }
}
