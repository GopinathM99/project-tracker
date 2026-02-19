import { projectService } from './project-service'
import { taskService } from './task-service'
import type { Task } from '@shared/schemas'

const CHECK_INTERVAL_MS = 15 * 60 * 1000 // 15 minutes
const REMINDER_WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours

/** Tracks sent notifications within a session to avoid duplicates */
const sentNotifications = new Set<string>()

let intervalId: ReturnType<typeof setInterval> | null = null

function makeKey(taskId: string, type: 'reminder' | 'overdue'): string {
  return `${taskId}:${type}`
}

async function getAllWorkspaceTasks(workspaceId: string): Promise<Task[]> {
  const projects = await projectService.getWorkspaceProjects(workspaceId)
  const activeProjects = projects.filter((p) => p.status !== 'Archived')

  const taskArrays = await Promise.all(
    activeProjects.map((p) => taskService.getProjectTasks(workspaceId, p.project_id)),
  )

  return taskArrays.flat()
}

async function sendNotification(title: string, body: string): Promise<void> {
  try {
    await window.electronAPI.showNotification(title, body)
  } catch {
    // Notification failures are non-critical; silently ignore
  }
}

export const notificationService = {
  start(workspaceId: string): void {
    // Prevent duplicate intervals
    if (intervalId !== null) {
      this.stop()
    }

    // Run an immediate check, then schedule periodic checks
    void this.checkNow(workspaceId)

    intervalId = setInterval(() => {
      void this.checkNow(workspaceId)
    }, CHECK_INTERVAL_MS)
  },

  stop(): void {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  },

  async checkNow(
    workspaceId: string,
    options?: { remindersEnabled?: boolean; overdueEnabled?: boolean },
  ): Promise<void> {
    const remindersEnabled = options?.remindersEnabled ?? true
    const overdueEnabled = options?.overdueEnabled ?? true

    try {
      const tasks = await getAllWorkspaceTasks(workspaceId)
      const now = Date.now()

      for (const task of tasks) {
        if (task.status === 'Done') continue
        if (!task.due_date) continue

        const dueTime = new Date(task.due_date).getTime()

        // Check for overdue tasks
        if (overdueEnabled && dueTime < now) {
          const key = makeKey(task.task_id, 'overdue')
          if (!sentNotifications.has(key)) {
            sentNotifications.add(key)
            await sendNotification(
              'Task Overdue',
              `"${task.title}" was due ${formatRelativeTime(dueTime, now)}`,
            )
          }
          continue
        }

        // Check for upcoming due tasks (within 24h window)
        if (remindersEnabled && dueTime - now <= REMINDER_WINDOW_MS) {
          const key = makeKey(task.task_id, 'reminder')
          if (!sentNotifications.has(key)) {
            sentNotifications.add(key)
            await sendNotification(
              'Task Due Soon',
              `"${task.title}" is due ${formatRelativeTime(dueTime, now)}`,
            )
          }
        }
      }
    } catch {
      // Fetch errors are non-critical; the next interval will retry
    }
  },
}

function formatRelativeTime(targetMs: number, nowMs: number): string {
  const diffMs = targetMs - nowMs
  const absDiffMs = Math.abs(diffMs)

  const hours = Math.floor(absDiffMs / (1000 * 60 * 60))
  const minutes = Math.floor((absDiffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (diffMs < 0) {
    // Past
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days} day${days > 1 ? 's' : ''} ago`
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`
    }
    return `${minutes}m ago`
  }

  // Future
  if (hours > 0) {
    return `in ${hours}h ${minutes}m`
  }
  return `in ${minutes}m`
}
