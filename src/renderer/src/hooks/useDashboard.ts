import { useState, useEffect } from 'react'
import { useProjects } from './useProjects'
import { useWorkspaceId } from './useWorkspace'
import { taskService } from '@/services/task-service'
import { bugService } from '@/services/bug-service'
import type { Task, Bug } from '@shared/schemas'
import type { Unsubscribe } from 'firebase/firestore'

/**
 * Aggregate all tasks and bugs across all active projects in the workspace.
 * Used by the Global Dashboard (FR-030).
 */
export function useDashboard() {
  const workspaceId = useWorkspaceId()
  const { projects, loading: projectsLoading } = useProjects()
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [allBugs, setAllBugs] = useState<Bug[]>([])
  const [tasksLoading, setTasksLoading] = useState(true)

  useEffect(() => {
    if (!workspaceId || projectsLoading) return

    const activeProjects = projects.filter((p) => p.status !== 'Archived')

    if (activeProjects.length === 0) {
      setAllTasks([])
      setAllBugs([])
      setTasksLoading(false)
      return
    }

    const taskUnsubs: Unsubscribe[] = []
    const bugUnsubs: Unsubscribe[] = []
    const tasksByProject: Record<string, Task[]> = {}
    const bugsByProject: Record<string, Bug[]> = {}
    let initialTaskLoad = false

    for (const project of activeProjects) {
      taskUnsubs.push(
        taskService.subscribeToProjectTasks(workspaceId, project.project_id, (tasks) => {
          tasksByProject[project.project_id] = tasks
          setAllTasks(Object.values(tasksByProject).flat())
          if (!initialTaskLoad) {
            initialTaskLoad = true
            setTasksLoading(false)
          }
        }),
      )

      bugUnsubs.push(
        bugService.subscribeToProjectBugs(workspaceId, project.project_id, (bugs) => {
          bugsByProject[project.project_id] = bugs
          setAllBugs(Object.values(bugsByProject).flat())
        }),
      )
    }

    return () => {
      taskUnsubs.forEach((u) => u())
      bugUnsubs.forEach((u) => u())
    }
  }, [workspaceId, projects, projectsLoading])

  return {
    projects: projects.filter((p) => p.status !== 'Archived'),
    allTasks,
    allBugs,
    loading: projectsLoading || tasksLoading,
  }
}
