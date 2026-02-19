import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProject } from '@/hooks/useProject'
import { useTasks } from '@/hooks/useTasks'
import { useMilestones } from '@/hooks/useMilestones'
import { useCanWrite, useIsOwner } from '@/hooks/usePermission'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { projectService } from '@/services/project-service'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { TaskList } from '@/features/tasks/components/TaskList'
import { TaskFilters } from '@/features/tasks/components/TaskFilters'
import { CreateTaskDialog } from '@/features/tasks/components/CreateTaskDialog'
import { EditProjectDialog } from './components/EditProjectDialog'
import { ProgressSummary } from './components/ProgressSummary'
import { MilestoneSection } from './components/MilestoneSection'
import { TagManager } from './components/TagManager'
import { AttachmentSection } from '@/features/attachments/AttachmentSection'
import { ActivityFeed } from '@/features/activity/ActivityFeed'
import { ExportDialog } from '@/features/export/ExportDialog'
import { ImportDialog } from '@/features/export/ImportDialog'
import { useBugs } from '@/hooks/useBugs'
import { BugList } from '@/features/bugs/components/BugList'
import { BugFilters } from '@/features/bugs/components/BugFilters'
import { CreateBugDialog } from '@/features/bugs/components/CreateBugDialog'
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer'
import { QuickAddTask } from '@/features/tasks/components/QuickAddTask'
import { RecurringTaskSection } from '@/features/recurring/RecurringTaskSection'
import { ArrowLeft, Plus, Pencil, Archive, ArchiveRestore, Download, Upload, Bug, Columns3, ExternalLink } from 'lucide-react'
import type { Task } from '@shared/schemas'

function statusColor(status: string): string {
  switch (status) {
    case 'Active':
      return 'bg-green-500/10 text-green-500'
    case 'On Hold':
      return 'bg-yellow-500/10 text-yellow-500'
    case 'Completed':
      return 'bg-blue-500/10 text-blue-500'
    case 'Archived':
      return 'bg-zinc-500/10 text-zinc-500'
    default:
      return 'bg-zinc-500/10 text-zinc-500'
  }
}

function isOverdue(task: Task): boolean {
  if (!task.due_date || task.status === 'Done') return false
  return new Date(task.due_date) < new Date()
}

export default function ProjectDetailPage(): JSX.Element {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { project, loading: projectLoading } = useProject(projectId)
  const { tasks, allTasks, loading: tasksLoading } = useTasks(projectId)
  const { milestones, loading: milestonesLoading } = useMilestones(projectId)
  const { bugs, allBugs, loading: bugsLoading } = useBugs(projectId)
  const canWrite = useCanWrite()
  const isOwner = useIsOwner()
  const workspaceId = useWorkspaceId()

  const [showEdit, setShowEdit] = useState(false)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showCreateBug, setShowCreateBug] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [archiving, setArchiving] = useState(false)

  if (projectLoading) {
    return <LoadingState />
  }

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        description="This project may have been deleted or you don't have access."
        action={{ label: 'Back to Projects', onClick: () => navigate('/projects') }}
      />
    )
  }

  const doneCount = allTasks.filter((t) => t.status === 'Done').length
  const inProgressCount = allTasks.filter((t) => t.status === 'In Progress').length
  const blockedCount = allTasks.filter((t) => t.status === 'Blocked').length
  const overdueCount = allTasks.filter((t) => isOverdue(t)).length

  async function handleArchive(): Promise<void> {
    if (!workspaceId || !project) return
    setArchiving(true)
    try {
      await projectService.archiveProject(workspaceId, project.project_id)
    } catch {
      // Error handling could be improved with toast notifications
    } finally {
      setArchiving(false)
    }
  }

  async function handleUnarchive(): Promise<void> {
    if (!workspaceId || !project) return
    setArchiving(true)
    try {
      await projectService.unarchiveProject(workspaceId, project.project_id)
    } catch {
      // Error handling could be improved with toast notifications
    } finally {
      setArchiving(false)
    }
  }

  return (
    <div className="h-full overflow-auto p-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/projects')}
        className="mb-4 inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </button>

      {/* Project header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(project.status)}`}
              >
                {project.status}
              </span>
            </div>
            {project.description && (
              <div className="mt-2">
                <MarkdownRenderer content={project.description} className="text-muted-foreground" />
              </div>
            )}
            <div className="mt-2 text-xs text-muted-foreground">
              {new Date(project.start_date).toLocaleDateString()} &ndash;{' '}
              {new Date(project.target_end_date).toLocaleDateString()}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setShowExport(true)}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            {canWrite && (
              <button
                onClick={() => setShowImport(true)}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Upload className="h-4 w-4" />
                Import
              </button>
            )}
            <button
              onClick={() => navigate(`/projects/${project.project_id}/kanban`)}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Columns3 className="h-4 w-4" />
              Kanban
            </button>
            <button
              onClick={() =>
                window.electronAPI.openNewWindow(`/projects/${project.project_id}`)
              }
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              title="Open in New Window"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          {canWrite && (
            <>
              <button
                onClick={() => setShowEdit(true)}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              {isOwner && (
                <>
                  {project.status === 'Archived' ? (
                    <button
                      onClick={handleUnarchive}
                      disabled={archiving}
                      className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
                    >
                      <ArchiveRestore className="h-4 w-4" />
                      {archiving ? 'Restoring...' : 'Unarchive'}
                    </button>
                  ) : (
                    <button
                      onClick={handleArchive}
                      disabled={archiving}
                      className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
                    >
                      <Archive className="h-4 w-4" />
                      {archiving ? 'Archiving...' : 'Archive'}
                    </button>
                  )}
                </>
              )}
            </>
          )}
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <TagManager project={project} />
      </div>

      {/* Stats bar */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-6">
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{allTasks.length}</p>
          <p className="text-xs text-muted-foreground">Total Tasks</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-green-500">{doneCount}</p>
          <p className="text-xs text-muted-foreground">Done</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-blue-500">{inProgressCount}</p>
          <p className="text-xs text-muted-foreground">In Progress</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-red-500">{blockedCount}</p>
          <p className="text-xs text-muted-foreground">Blocked</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-orange-500">{overdueCount}</p>
          <p className="text-xs text-muted-foreground">Overdue</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-purple-500">{allBugs.length}</p>
          <p className="text-xs text-muted-foreground">Bugs</p>
        </div>
      </div>

      {/* Progress Summary */}
      <ProgressSummary tasks={allTasks} milestones={milestones} />

      {/* Milestones */}
      <MilestoneSection
        projectId={project.project_id}
        milestones={milestones}
        milestonesLoading={milestonesLoading}
      />

      {/* Task section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Tasks</h2>
          {canWrite && (
            <button
              onClick={() => setShowCreateTask(true)}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </button>
          )}
        </div>

        {canWrite && (
          <div className="mb-4">
            <QuickAddTask projectId={project.project_id} />
          </div>
        )}

        <div className="mb-4">
          <TaskFilters />
        </div>

        {tasksLoading ? (
          <LoadingState />
        ) : (
          <TaskList tasks={tasks} projectId={project.project_id} />
        )}
      </div>

      {/* Bug section (T18: Bug Tracking Module) */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-foreground">
            <Bug className="h-5 w-5" />
            Bugs
          </h2>
          {canWrite && (
            <button
              onClick={() => setShowCreateBug(true)}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Report Bug
            </button>
          )}
        </div>

        <div className="mb-4">
          <BugFilters />
        </div>

        {bugsLoading ? (
          <LoadingState />
        ) : (
          <BugList bugs={bugs} projectId={project.project_id} />
        )}
      </div>

      {/* Recurring Tasks */}
      <RecurringTaskSection projectId={project.project_id} tasks={allTasks} />

      {/* Attachments */}
      <div className="mt-6">
        <AttachmentSection entityType="Project" entityId={project.project_id} />
      </div>

      {/* Activity */}
      <div className="mt-6">
        <ActivityFeed workspaceId={workspaceId!} scope="project" projectId={project.project_id} />
      </div>

      {/* Dialogs */}
      <EditProjectDialog
        open={showEdit}
        onClose={() => setShowEdit(false)}
        project={project}
      />
      <CreateTaskDialog
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        projectId={project.project_id}
      />
      <CreateBugDialog
        open={showCreateBug}
        onClose={() => setShowCreateBug(false)}
        projectId={project.project_id}
      />
      <ExportDialog
        open={showExport}
        onClose={() => setShowExport(false)}
        projectId={project.project_id}
        projectName={project.name}
      />
      <ImportDialog
        open={showImport}
        onClose={() => setShowImport(false)}
        projectId={project.project_id}
      />
    </div>
  )
}
