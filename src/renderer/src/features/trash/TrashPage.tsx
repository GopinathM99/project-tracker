import { useState, useEffect, useCallback } from 'react'
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { trashService } from '@/services/trash-service'
import { taskService } from '@/services/task-service'
import { bugService } from '@/services/bug-service'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { FIELD_LIMITS } from '@shared/constants/validation'
import { db } from '@/lib/firestore'
import { doc, updateDoc } from 'firebase/firestore'
import { generateTimestamp } from '@shared/utils'
import type { Task, Bug, Project } from '@shared/schemas'

type TrashTab = 'tasks' | 'bugs' | 'projects'

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString()
}

function isExpired(deletedAt: string): boolean {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - FIELD_LIMITS.TRASH_PURGE_DAYS)
  return new Date(deletedAt) < cutoff
}

export default function TrashPage(): JSX.Element {
  const workspaceId = useWorkspaceId()
  const [activeTab, setActiveTab] = useState<TrashTab>('tasks')
  const [tasks, setTasks] = useState<Task[]>([])
  const [bugs, setBugs] = useState<Bug[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [purging, setPurging] = useState(false)

  const loadTrash = useCallback(async () => {
    if (!workspaceId) return
    setLoading(true)
    try {
      const [deletedTasks, deletedBugs, deletedProjects] = await Promise.all([
        trashService.getDeletedTasks(workspaceId),
        trashService.getDeletedBugs(workspaceId),
        trashService.getDeletedProjects(workspaceId),
      ])
      setTasks(deletedTasks)
      setBugs(deletedBugs)
      setProjects(deletedProjects)
    } catch {
      // Error handling
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    loadTrash()
  }, [loadTrash])

  async function handleRestoreTask(taskId: string): Promise<void> {
    if (!workspaceId) return
    await taskService.restoreTask(workspaceId, taskId)
    setTasks((prev) => prev.filter((t) => t.task_id !== taskId))
  }

  async function handleRestoreBug(bugId: string): Promise<void> {
    if (!workspaceId) return
    await bugService.restoreBug(workspaceId, bugId)
    setBugs((prev) => prev.filter((b) => b.bug_id !== bugId))
  }

  async function handleRestoreProject(projectId: string): Promise<void> {
    if (!workspaceId) return
    const projRef = doc(db, 'workspaces', workspaceId, 'projects', projectId)
    await updateDoc(projRef, { deleted_at: null, updated_at: generateTimestamp() })
    setProjects((prev) => prev.filter((p) => p.project_id !== projectId))
  }

  async function handlePurgeTask(taskId: string): Promise<void> {
    if (!workspaceId) return
    await trashService.permanentlyDeleteTask(workspaceId, taskId)
    setTasks((prev) => prev.filter((t) => t.task_id !== taskId))
  }

  async function handlePurgeBug(bugId: string): Promise<void> {
    if (!workspaceId) return
    await trashService.permanentlyDeleteBug(workspaceId, bugId)
    setBugs((prev) => prev.filter((b) => b.bug_id !== bugId))
  }

  async function handlePurgeProject(projectId: string): Promise<void> {
    if (!workspaceId) return
    await trashService.permanentlyDeleteProject(workspaceId, projectId)
    setProjects((prev) => prev.filter((p) => p.project_id !== projectId))
  }

  async function handlePurgeAllExpired(): Promise<void> {
    if (!workspaceId) return
    setPurging(true)
    try {
      await trashService.purgeExpired(workspaceId)
      await loadTrash()
    } catch {
      // Error handling
    } finally {
      setPurging(false)
    }
  }

  const tabs: { key: TrashTab; label: string; count: number }[] = [
    { key: 'tasks', label: 'Tasks', count: tasks.length },
    { key: 'bugs', label: 'Bugs', count: bugs.length },
    { key: 'projects', label: 'Projects', count: projects.length },
  ]

  const totalExpired =
    tasks.filter((t) => t.deleted_at && isExpired(t.deleted_at)).length +
    bugs.filter((b) => b.deleted_at && isExpired(b.deleted_at)).length +
    projects.filter((p) => p.deleted_at && isExpired(p.deleted_at)).length

  return (
    <div className="h-full overflow-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Trash</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Deleted items are kept for {FIELD_LIMITS.TRASH_PURGE_DAYS} days before permanent removal.
        </p>
      </div>

      {/* Purge all expired button */}
      {totalExpired > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span className="flex-1 text-sm text-destructive">
            {totalExpired} item{totalExpired !== 1 ? 's' : ''} expired and eligible for permanent deletion.
          </span>
          <button
            onClick={handlePurgeAllExpired}
            disabled={purging}
            className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            {purging ? 'Purging...' : 'Purge All Expired'}
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === tab.key
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
      ) : (
        <div className="flex flex-col gap-2">
          {activeTab === 'tasks' && (
            <>
              {tasks.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No deleted tasks.</p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.task_id}
                    className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium text-foreground truncate">{task.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        Deleted {task.deleted_at ? formatDate(task.deleted_at) : 'Unknown'}
                        {task.deleted_at && isExpired(task.deleted_at) && (
                          <span className="ml-2 font-medium text-destructive">Expired</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRestoreTask(task.task_id)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Restore
                    </button>
                    <button
                      onClick={() => handlePurgeTask(task.task_id)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" />
                      Purge
                    </button>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'bugs' && (
            <>
              {bugs.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No deleted bugs.</p>
              ) : (
                bugs.map((bug) => (
                  <div
                    key={bug.bug_id}
                    className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium text-foreground truncate">{bug.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        Deleted {bug.deleted_at ? formatDate(bug.deleted_at) : 'Unknown'}
                        {bug.deleted_at && isExpired(bug.deleted_at) && (
                          <span className="ml-2 font-medium text-destructive">Expired</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRestoreBug(bug.bug_id)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Restore
                    </button>
                    <button
                      onClick={() => handlePurgeBug(bug.bug_id)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" />
                      Purge
                    </button>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'projects' && (
            <>
              {projects.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No deleted projects.
                </p>
              ) : (
                projects.map((project) => (
                  <div
                    key={project.project_id}
                    className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {project.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Deleted {project.deleted_at ? formatDate(project.deleted_at) : 'Unknown'}
                        {project.deleted_at && isExpired(project.deleted_at) && (
                          <span className="ml-2 font-medium text-destructive">Expired</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRestoreProject(project.project_id)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Restore
                    </button>
                    <button
                      onClick={() => handlePurgeProject(project.project_id)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" />
                      Purge
                    </button>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
