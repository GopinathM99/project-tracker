import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { useProject } from '@/hooks/useProject'
import { useCanWrite } from '@/hooks/usePermission'
import { taskService } from '@/services/task-service'
import { projectService } from '@/services/project-service'
import { useKanbanStore } from '@/stores/kanbanStore'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { KanbanColumn } from './KanbanColumn'
import { KanbanHeader } from './KanbanHeader'
import { KanbanFilters } from './KanbanFilters'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import type { Task } from '@shared/schemas'
import type { Project } from '@shared/schemas'

const STATUSES = ['Not Started', 'In Progress', 'Blocked', 'Done'] as const

function getMonthRange(): { start: Date; end: Date; label: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  const label = now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  return { start, end, label }
}

function isInCurrentMonth(dueDate: string): boolean {
  const { start, end } = getMonthRange()
  const date = new Date(dueDate)
  return date >= start && date <= end
}

function isInCurrentWeek(dueDate: string): boolean {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  const date = new Date(dueDate)
  return date >= startOfWeek && date <= endOfWeek
}

export default function KanbanPage(): JSX.Element {
  const { projectId } = useParams<{ projectId?: string }>()
  const navigate = useNavigate()
  const workspaceId = useWorkspaceId()
  const canWrite = useCanWrite()
  const filters = useKanbanStore((s) => s.filters)
  const clearFilters = useKanbanStore((s) => s.clearFilters)

  const isMonthly = !projectId

  // --- Project Kanban state ---
  const { project, loading: projectLoading } = useProject(isMonthly ? undefined : projectId)
  const [projectTasks, setProjectTasks] = useState<Task[]>([])
  const [projectTasksLoading, setProjectTasksLoading] = useState(false)

  // --- Monthly Kanban state ---
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [monthlyTasks, setMonthlyTasks] = useState<Task[]>([])
  const [monthlyLoading, setMonthlyLoading] = useState(false)

  // Clear filters on unmount
  useEffect(() => {
    return () => {
      clearFilters()
    }
  }, [clearFilters])

  // Subscribe to project tasks (project scope)
  useEffect(() => {
    if (isMonthly || !workspaceId || !projectId) return

    setProjectTasksLoading(true)
    const unsubscribe = taskService.subscribeToProjectTasks(workspaceId, projectId, (tasks) => {
      setProjectTasks(tasks)
      setProjectTasksLoading(false)
    })

    return () => {
      unsubscribe()
      setProjectTasks([])
    }
  }, [isMonthly, workspaceId, projectId])

  // Subscribe to all projects (monthly scope)
  useEffect(() => {
    if (!isMonthly || !workspaceId) return

    const unsubscribe = projectService.subscribeToProjects(workspaceId, (projects) => {
      setAllProjects(projects)
    })

    return () => {
      unsubscribe()
      setAllProjects([])
    }
  }, [isMonthly, workspaceId])

  // Subscribe to tasks for all active projects (monthly scope)
  useEffect(() => {
    if (!isMonthly || !workspaceId || allProjects.length === 0) {
      if (isMonthly) setMonthlyTasks([])
      return
    }

    setMonthlyLoading(true)
    const activeProjects = allProjects.filter(
      (p) => p.status === 'Active' || p.status === 'On Hold'
    )

    if (activeProjects.length === 0) {
      setMonthlyTasks([])
      setMonthlyLoading(false)
      return
    }

    const tasksByProject = new Map<string, Task[]>()
    let loadedCount = 0

    const unsubscribes = activeProjects.map((proj) =>
      taskService.subscribeToProjectTasks(workspaceId, proj.project_id, (tasks) => {
        tasksByProject.set(proj.project_id, tasks)
        loadedCount++

        // Combine all tasks once we have at least one callback per project
        if (loadedCount >= activeProjects.length) {
          const combined: Task[] = []
          tasksByProject.forEach((projectTasks) => {
            combined.push(...projectTasks)
          })
          setMonthlyTasks(combined)
          setMonthlyLoading(false)
        }
      })
    )

    return () => {
      unsubscribes.forEach((unsub) => unsub())
      setMonthlyTasks([])
    }
  }, [isMonthly, workspaceId, allProjects])

  // Determine raw tasks based on scope
  const rawTasks = isMonthly ? monthlyTasks : projectTasks
  const loading = isMonthly ? monthlyLoading : projectTasksLoading || projectLoading

  // For monthly kanban: filter to only tasks with due_date in current month
  const scopedTasks = useMemo(() => {
    if (!isMonthly) return rawTasks
    return rawTasks.filter((t) => t.due_date && isInCurrentMonth(t.due_date))
  }, [isMonthly, rawTasks])

  // Apply user filters
  const filteredTasks = useMemo(() => {
    let tasks = scopedTasks

    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      tasks = tasks.filter((t) => filters.priority!.includes(t.priority))
    }

    // Owner filter
    if (filters.owner) {
      const ownerTerm = filters.owner.toLowerCase()
      tasks = tasks.filter((t) => t.owner?.toLowerCase().includes(ownerTerm))
    }

    // Project filter (monthly only)
    if (isMonthly && filters.projectId) {
      tasks = tasks.filter((t) => t.project_id === filters.projectId)
    }

    // Due date window
    if (filters.dueDateWindow === 'this_week') {
      tasks = tasks.filter((t) => t.due_date && isInCurrentWeek(t.due_date))
    } else if (filters.dueDateWindow === 'this_month') {
      tasks = tasks.filter((t) => t.due_date && isInCurrentMonth(t.due_date))
    }

    return tasks
  }, [scopedTasks, filters, isMonthly])

  // Group tasks by status
  const columnData = useMemo(() => {
    const groups: Record<string, Task[]> = {}
    for (const status of STATUSES) {
      groups[status] = []
    }
    for (const task of filteredTasks) {
      if (groups[task.status]) {
        groups[task.status].push(task)
      }
    }
    return groups
  }, [filteredTasks])

  // Project name map for monthly kanban cards
  const projectNameMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const p of allProjects) {
      map[p.project_id] = p.name
    }
    return map
  }, [allProjects])

  // Handle drop: update task status and/or kanban sort order
  const handleDrop = useCallback(
    async (taskId: string, newStatus: string, kanbanSortOrder?: number) => {
      if (!workspaceId) return

      try {
        const changes: Partial<Pick<Task, 'status' | 'kanban_sort_order'>> = {
          status: newStatus as Task['status'],
        }
        if (kanbanSortOrder !== undefined) {
          changes.kanban_sort_order = kanbanSortOrder
        }
        await taskService.updateTask(workspaceId, taskId, changes)
      } catch {
        // Firestore listener will reconcile state automatically
      }
    },
    [workspaceId]
  )

  // Scope label
  const scopeLabel = isMonthly
    ? `Monthly Kanban: ${getMonthRange().label}`
    : `Project Kanban: ${project?.name ?? ''}`

  if (loading) {
    return <LoadingState />
  }

  if (!isMonthly && !project) {
    return (
      <EmptyState
        title="Project not found"
        description="This project may have been deleted or you don't have access."
        action={{ label: 'Back to Projects', onClick: () => navigate('/projects') }}
      />
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden p-6">
      {/* Navigation */}
      {!isMonthly && (
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() => navigate(`/projects/${projectId}`)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Project
          </button>
          <button
            onClick={() =>
              window.electronAPI.openNewWindow(`/projects/${projectId}/kanban`)
            }
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            title="Open in New Window"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            New Window
          </button>
        </div>
      )}

      {/* Header with progress summary */}
      <KanbanHeader tasks={scopedTasks} scopeLabel={scopeLabel} />

      {/* Filters */}
      <KanbanFilters isMonthly={isMonthly} projects={isMonthly ? allProjects : undefined} />

      {/* Board columns */}
      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={columnData[status]}
            canWrite={canWrite}
            onDrop={handleDrop}
            showProjectName={isMonthly}
            projectNameMap={isMonthly ? projectNameMap : undefined}
          />
        ))}
      </div>
    </div>
  )
}
