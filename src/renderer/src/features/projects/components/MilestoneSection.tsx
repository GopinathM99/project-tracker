import { useState } from 'react'
import { useCanWrite } from '@/hooks/usePermission'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { useTasks } from '@/hooks/useTasks'
import { milestoneService } from '@/services/milestone-service'
import { CreateMilestoneDialog } from './CreateMilestoneDialog'
import { EditMilestoneDialog } from './EditMilestoneDialog'
import { LoadingState } from '@/components/shared/LoadingState'
import {
  Target,
  Plus,
  ChevronDown,
  ChevronRight,
  Clock,
  Pencil,
  Trash2,
} from 'lucide-react'
import type { Milestone } from '@shared/schemas'

interface MilestoneSectionProps {
  projectId: string
  milestones: Milestone[]
  milestonesLoading: boolean
}

function milestoneStatusColor(status: string): string {
  switch (status) {
    case 'Planned':
      return 'bg-zinc-500/10 text-zinc-500'
    case 'In Progress':
      return 'bg-blue-500/10 text-blue-500'
    case 'Completed':
      return 'bg-green-500/10 text-green-500'
    case 'Delayed':
      return 'bg-orange-500/10 text-orange-500'
    default:
      return 'bg-zinc-500/10 text-zinc-500'
  }
}

export function MilestoneSection({
  projectId,
  milestones,
  milestonesLoading,
}: MilestoneSectionProps): JSX.Element {
  const canWrite = useCanWrite()
  const workspaceId = useWorkspaceId()
  const { allTasks } = useTasks(projectId)
  const [showCreate, setShowCreate] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function toggleExpanded(milestoneId: string): void {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(milestoneId)) {
        next.delete(milestoneId)
      } else {
        next.add(milestoneId)
      }
      return next
    })
  }

  async function handleDelete(milestoneId: string): Promise<void> {
    if (!workspaceId) return
    setDeletingId(milestoneId)
    try {
      await milestoneService.deleteMilestone(workspaceId, milestoneId)
    } catch {
      // Error handling could be improved with toast notifications
    } finally {
      setDeletingId(null)
    }
  }

  // Sort milestones: In Progress first, then Planned, Delayed, Completed last
  const sortedMilestones = [...milestones].sort((a, b) => {
    const order: Record<string, number> = {
      'In Progress': 0,
      Planned: 1,
      Delayed: 2,
      Completed: 3,
    }
    return (order[a.status] ?? 4) - (order[b.status] ?? 4)
  })

  return (
    <div className="mb-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Target className="h-5 w-5" />
          Milestones
        </h2>
        {canWrite && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Milestone
          </button>
        )}
      </div>

      {milestonesLoading ? (
        <LoadingState />
      ) : sortedMilestones.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <Target className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No milestones yet.</p>
          {canWrite && (
            <p className="mt-1 text-xs text-muted-foreground">
              Create a milestone to track key project deliverables.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedMilestones.map((milestone) => {
            const isExpanded = expandedIds.has(milestone.milestone_id)
            const linkedTasks = allTasks.filter((t) =>
              milestone.linked_task_ids.includes(t.task_id),
            )
            const linkedDone = linkedTasks.filter((t) => t.status === 'Done').length
            const linkedTotal = linkedTasks.length
            const linkedPercent =
              linkedTotal > 0 ? Math.round((linkedDone / linkedTotal) * 100) : 0

            return (
              <div
                key={milestone.milestone_id}
                className="rounded-lg border border-border bg-card"
              >
                {/* Milestone card header */}
                <div
                  className="flex cursor-pointer items-center gap-3 p-4"
                  onClick={() => toggleExpanded(milestone.milestone_id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-foreground">
                        {milestone.title}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${milestoneStatusColor(milestone.status)}`}
                      >
                        {milestone.status}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(milestone.target_date).toLocaleDateString()}
                      </span>
                      {linkedTotal > 0 && (
                        <span>
                          {linkedTotal} task{linkedTotal !== 1 ? 's' : ''} linked
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Linked task progress bar (compact) */}
                  {linkedTotal > 0 && (
                    <div className="flex w-32 shrink-0 items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-green-500 transition-all duration-300"
                          style={{ width: `${linkedPercent}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{linkedPercent}%</span>
                    </div>
                  )}

                  {/* Action buttons */}
                  {canWrite && (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingMilestone(milestone)
                        }}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                        title="Edit milestone"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(milestone.milestone_id)
                        }}
                        disabled={deletingId === milestone.milestone_id}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                        title="Delete milestone"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border px-4 py-3">
                    {milestone.description && (
                      <p className="mb-3 text-sm text-muted-foreground">
                        {milestone.description}
                      </p>
                    )}

                    <div className="mb-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                      {milestone.start_date && (
                        <span>
                          Start: {new Date(milestone.start_date).toLocaleDateString()}
                        </span>
                      )}
                      <span>
                        Target: {new Date(milestone.target_date).toLocaleDateString()}
                      </span>
                      {milestone.completed_at && (
                        <span>
                          Completed: {new Date(milestone.completed_at).toLocaleDateString()}
                        </span>
                      )}
                      {milestone.owner && <span>Owner: {milestone.owner}</span>}
                    </div>

                    {/* Linked tasks list */}
                    {linkedTotal > 0 ? (
                      <div>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                          Linked Tasks ({linkedDone}/{linkedTotal} done)
                        </p>
                        <div className="space-y-1">
                          {linkedTasks.map((task) => (
                            <div
                              key={task.task_id}
                              className="flex items-center gap-2 rounded-md px-2 py-1 text-sm"
                            >
                              <span
                                className={`h-2 w-2 shrink-0 rounded-full ${
                                  task.status === 'Done'
                                    ? 'bg-green-500'
                                    : task.status === 'In Progress'
                                      ? 'bg-blue-500'
                                      : task.status === 'Blocked'
                                        ? 'bg-red-500'
                                        : 'bg-zinc-400'
                                }`}
                              />
                              <span
                                className={`truncate ${task.status === 'Done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                              >
                                {task.title}
                              </span>
                              <span className="shrink-0 text-xs text-muted-foreground">
                                {task.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No tasks linked to this milestone.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Dialogs */}
      <CreateMilestoneDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        projectId={projectId}
      />

      {editingMilestone && (
        <EditMilestoneDialog
          open={!!editingMilestone}
          onClose={() => setEditingMilestone(null)}
          milestone={editingMilestone}
          tasks={allTasks}
        />
      )}
    </div>
  )
}
