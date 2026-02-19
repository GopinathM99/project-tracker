import type { Project, Task, Bug } from '@shared/schemas'

export interface SearchResult {
  type: 'project' | 'task' | 'bug'
  id: string
  projectId: string
  title: string
  description: string
  status: string
  matchField: 'title' | 'description'
}

const MAX_RESULTS = 50

/**
 * Search across projects, tasks, and bugs by keyword.
 * Case-insensitive. Title matches are ranked before description matches.
 */
export function searchEntities(
  projects: Project[],
  tasks: Task[],
  bugs: Bug[],
  query: string,
  entityFilter: 'all' | 'project' | 'task' | 'bug' = 'all',
  statusFilter: string | null = null
): SearchResult[] {
  const trimmed = query.trim()
  if (!trimmed) return []

  const lowerQuery = trimmed.toLowerCase()

  const titleMatches: SearchResult[] = []
  const descriptionMatches: SearchResult[] = []

  // Search projects
  if (entityFilter === 'all' || entityFilter === 'project') {
    for (const project of projects) {
      if (statusFilter && project.status !== statusFilter) continue

      const titleMatch = project.name.toLowerCase().includes(lowerQuery)
      const descMatch = project.description.toLowerCase().includes(lowerQuery)

      if (titleMatch) {
        titleMatches.push({
          type: 'project',
          id: project.project_id,
          projectId: project.project_id,
          title: project.name,
          description: project.description,
          status: project.status,
          matchField: 'title',
        })
      } else if (descMatch) {
        descriptionMatches.push({
          type: 'project',
          id: project.project_id,
          projectId: project.project_id,
          title: project.name,
          description: project.description,
          status: project.status,
          matchField: 'description',
        })
      }
    }
  }

  // Search tasks
  if (entityFilter === 'all' || entityFilter === 'task') {
    for (const task of tasks) {
      if (statusFilter && task.status !== statusFilter) continue

      const titleMatch = task.title.toLowerCase().includes(lowerQuery)
      const descMatch = task.description.toLowerCase().includes(lowerQuery)

      if (titleMatch) {
        titleMatches.push({
          type: 'task',
          id: task.task_id,
          projectId: task.project_id,
          title: task.title,
          description: task.description,
          status: task.status,
          matchField: 'title',
        })
      } else if (descMatch) {
        descriptionMatches.push({
          type: 'task',
          id: task.task_id,
          projectId: task.project_id,
          title: task.title,
          description: task.description,
          status: task.status,
          matchField: 'description',
        })
      }
    }
  }

  // Search bugs
  if (entityFilter === 'all' || entityFilter === 'bug') {
    for (const bug of bugs) {
      if (statusFilter && bug.status !== statusFilter) continue

      const titleMatch = bug.title.toLowerCase().includes(lowerQuery)
      const descMatch = bug.description.toLowerCase().includes(lowerQuery)

      if (titleMatch) {
        titleMatches.push({
          type: 'bug',
          id: bug.bug_id,
          projectId: bug.project_id,
          title: bug.title,
          description: bug.description,
          status: bug.status,
          matchField: 'title',
        })
      } else if (descMatch) {
        descriptionMatches.push({
          type: 'bug',
          id: bug.bug_id,
          projectId: bug.project_id,
          title: bug.title,
          description: bug.description,
          status: bug.status,
          matchField: 'description',
        })
      }
    }
  }

  // Title matches first, then description matches. Limit to MAX_RESULTS.
  return [...titleMatches, ...descriptionMatches].slice(0, MAX_RESULTS)
}
