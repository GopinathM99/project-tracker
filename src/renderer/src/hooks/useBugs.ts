import { useEffect, useMemo } from 'react'
import { useBugStore } from '@/stores/bugStore'
import { bugService, filterBugs, sortBugs } from '@/services/bug-service'
import { useWorkspaceId } from './useWorkspace'

/**
 * Subscribe to bugs for a project. Applies filters and sorting from the bug store.
 * Returns { bugs (filtered+sorted), allBugs (unfiltered), loading }
 */
export function useBugs(projectId: string | undefined) {
  const workspaceId = useWorkspaceId()
  const allBugs = useBugStore((s) => s.bugs)
  const loading = useBugStore((s) => s.loading)
  const filters = useBugStore((s) => s.filters)
  const sortField = useBugStore((s) => s.sortField)
  const sortOrder = useBugStore((s) => s.sortOrder)
  const setBugs = useBugStore((s) => s.setBugs)
  const setLoading = useBugStore((s) => s.setLoading)

  useEffect(() => {
    if (!workspaceId || !projectId) return

    setLoading(true)
    const unsubscribe = bugService.subscribeToProjectBugs(workspaceId, projectId, (bugs) => {
      setBugs(bugs)
      setLoading(false)
    })

    return () => {
      unsubscribe()
      setBugs([])
    }
  }, [workspaceId, projectId, setBugs, setLoading])

  const bugs = useMemo(() => {
    const filtered = filterBugs(allBugs, filters)
    return sortBugs(filtered, sortField, sortOrder)
  }, [allBugs, filters, sortField, sortOrder])

  return { bugs, allBugs, loading }
}
