import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { FolderOpen } from 'lucide-react'
import type { Project, Task } from '@shared/schemas'

interface ProjectOverviewProps {
  projects: Project[]
  tasks: Task[]
}

function statusColor(status: string): string {
  switch (status) {
    case 'Active':
      return 'bg-green-500/10 text-green-500'
    case 'On Hold':
      return 'bg-yellow-500/10 text-yellow-500'
    case 'Completed':
      return 'bg-blue-500/10 text-blue-500'
    default:
      return 'bg-zinc-500/10 text-zinc-500'
  }
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString()
}

export function ProjectOverview({ projects, tasks }: ProjectOverviewProps): JSX.Element {
  // Build a map of project_id -> tasks
  const tasksByProject = new Map<string, Task[]>()
  for (const task of tasks) {
    const existing = tasksByProject.get(task.project_id) ?? []
    existing.push(task)
    tasksByProject.set(task.project_id, existing)
  }

  // Sort projects by name
  const sortedProjects = [...projects].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <FolderOpen className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">Project Overview</h2>
      </div>

      {sortedProjects.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No active projects.
        </p>
      ) : (
        <div className="space-y-3">
          {sortedProjects.map((project) => {
            const projectTasks = tasksByProject.get(project.project_id) ?? []
            const totalTasks = projectTasks.length
            const doneTasks = projectTasks.filter((t) => t.status === 'Done').length
            const percent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

            return (
              <Link
                key={project.project_id}
                to={`/projects/${project.project_id}`}
                className="block rounded-md border border-border/50 p-3 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {project.name}
                      </p>
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                          statusColor(project.status),
                        )}
                      >
                        {project.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(project.start_date)} &ndash; {formatDate(project.target_end_date)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium text-foreground">
                      {doneTasks}/{totalTasks}
                    </p>
                    <p className="text-xs text-muted-foreground">{percent}% complete</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
