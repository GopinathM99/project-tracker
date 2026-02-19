import { projectService } from './project-service'
import { taskService } from './task-service'
import type { Project, Task } from '@shared/schemas'

export interface ExportData {
  projects?: Project[]
  tasks: Task[]
  exportedAt: string
  version: string
}

export const exportService = {
  async exportProjectToJSON(
    workspaceId: string,
    projectId: string,
  ): Promise<ExportData> {
    const project = await projectService.getProject(workspaceId, projectId)
    const tasks = await taskService.getProjectTasks(workspaceId, projectId)
    return {
      projects: project ? [project] : [],
      tasks,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }
  },

  async exportProjectToCSV(
    workspaceId: string,
    projectId: string,
  ): Promise<string> {
    const tasks = await taskService.getProjectTasks(workspaceId, projectId)
    const headers = [
      'task_id',
      'title',
      'status',
      'priority',
      'owner',
      'start_date',
      'expected_completion_date',
      'due_date',
      'description',
    ]
    const rows = tasks.map((t) =>
      headers
        .map((h) => {
          const val = t[h as keyof typeof t]
          const str = val === null || val === undefined ? '' : String(val)
          // Escape CSV: quote if contains comma, newline, or quote
          if (str.includes(',') || str.includes('\n') || str.includes('"')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        })
        .join(','),
    )
    return [headers.join(','), ...rows].join('\n')
  },

  async exportWorkspaceToJSON(workspaceId: string): Promise<ExportData> {
    const projects = await projectService.getWorkspaceProjects(workspaceId)
    const allTasks: Task[] = []
    for (const p of projects) {
      const tasks = await taskService.getProjectTasks(
        workspaceId,
        p.project_id,
      )
      allTasks.push(...tasks)
    }
    return {
      projects,
      tasks: allTasks,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }
  },

  parseImportJSON(jsonString: string): { projects: Project[]; tasks: Task[] } {
    const data = JSON.parse(jsonString)
    return {
      projects: data.projects || [],
      tasks: data.tasks || [],
    }
  },

  parseImportCSV(csvString: string): Record<string, string>[] {
    const lines = csvString.split('\n').filter((l) => l.trim())
    if (lines.length < 2) return []
    const headers = lines[0].split(',').map((h) => h.trim())
    return lines.slice(1).map((line) => {
      // CSV parsing that handles basic quoting
      const values: string[] = []
      let current = ''
      let inQuotes = false
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current)
          current = ''
        } else {
          current += char
        }
      }
      values.push(current)
      const record: Record<string, string> = {}
      headers.forEach((h, i) => {
        record[h] = values[i]?.trim() || ''
      })
      return record
    })
  },
}
