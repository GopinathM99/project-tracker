import { useEffect, useMemo } from 'react'
import { useTaskStore } from '@/stores/taskStore'
import { taskService, filterTasks, sortTasks } from '@/services/task-service'
import { useWorkspaceId } from './useWorkspace'

/**
 * Subscribe to tasks for a project. Applies filters and sorting from the task store.
 * Returns { tasks (filtered+sorted), allTasks (unfiltered), loading }
 */
export function useTasks(projectId: string | undefined) {
  const workspaceId = useWorkspaceId()
  const allTasks = useTaskStore((s) => s.tasks)
  const loading = useTaskStore((s) => s.loading)
  const filters = useTaskStore((s) => s.filters)
  const sortField = useTaskStore((s) => s.sortField)
  const sortOrder = useTaskStore((s) => s.sortOrder)
  const setTasks = useTaskStore((s) => s.setTasks)
  const setLoading = useTaskStore((s) => s.setLoading)

  useEffect(() => {
    if (!workspaceId || !projectId) return

    setLoading(true)
    const unsubscribe = taskService.subscribeToProjectTasks(workspaceId, projectId, (tasks) => {
      setTasks(tasks)
      setLoading(false)
    })

    return () => {
      unsubscribe()
      setTasks([])
    }
  }, [workspaceId, projectId, setTasks, setLoading])

  const tasks = useMemo(() => {
    const filtered = filterTasks(allTasks, filters)
    return sortTasks(filtered, sortField, sortOrder)
  }, [allTasks, filters, sortField, sortOrder])

  return { tasks, allTasks, loading }
}
