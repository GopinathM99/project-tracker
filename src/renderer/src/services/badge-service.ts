import { projectService } from './project-service'
import { taskService } from './task-service'

const BADGE_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

let intervalId: ReturnType<typeof setInterval> | null = null

async function countOverdueTasks(workspaceId: string): Promise<number> {
  const projects = await projectService.getWorkspaceProjects(workspaceId)
  const activeProjects = projects.filter((p) => p.status !== 'Archived')

  const taskArrays = await Promise.all(
    activeProjects.map((p) => taskService.getProjectTasks(workspaceId, p.project_id)),
  )

  const allTasks = taskArrays.flat()
  const now = Date.now()

  return allTasks.filter((task) => {
    if (task.status === 'Done') return false
    if (!task.due_date) return false
    return new Date(task.due_date).getTime() < now
  }).length
}

async function updateBadge(workspaceId: string): Promise<void> {
  try {
    const overdueCount = await countOverdueTasks(workspaceId)
    await window.electronAPI.setBadgeCount(overdueCount)
  } catch {
    // Badge update failures are non-critical; silently ignore
  }
}

export const badgeService = {
  start(workspaceId: string): void {
    if (intervalId !== null) {
      this.stop()
    }

    // Run an immediate update, then schedule periodic updates
    void updateBadge(workspaceId)

    intervalId = setInterval(() => {
      void updateBadge(workspaceId)
    }, BADGE_INTERVAL_MS)
  },

  stop(): void {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }

    // Clear the badge when stopping
    try {
      void window.electronAPI.setBadgeCount(0)
    } catch {
      // Ignore errors during cleanup
    }
  },
}
