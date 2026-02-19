import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { entityLinkService } from '@/services/entity-link-service'
import { taskService } from '@/services/task-service'
import { bugService } from '@/services/bug-service'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { useCanWrite } from '@/hooks/usePermission'
import { FIELD_LIMITS } from '@shared/constants/validation'
import type { EntityLink } from '@shared/schemas'
import { Link2, Plus, X, ExternalLink, Bug as BugIcon, CheckCircle } from 'lucide-react'

interface EntityLinkSectionProps {
  entityType: 'Task' | 'Bug'
  entityId: string
  projectId: string
}

const RELATION_LABELS = ['Related', 'RelatedBug', 'FixTask', 'Blocks', 'BlockedBy'] as const

type SearchableEntity = {
  id: string
  type: 'Task' | 'Bug'
  title: string
}

export function EntityLinkSection({
  entityType,
  entityId,
  projectId,
}: EntityLinkSectionProps): JSX.Element {
  const workspaceId = useWorkspaceId()
  const canWrite = useCanWrite()
  const [links, setLinks] = useState<EntityLink[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  // Linked entity titles cache
  const [entityTitles, setEntityTitles] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    if (!workspaceId) return

    const unsubscribe = entityLinkService.subscribeToEntityLinks(
      workspaceId,
      entityType,
      entityId,
      (updatedLinks) => {
        setLinks(updatedLinks)
        setLoading(false)
      },
    )

    return () => {
      unsubscribe()
    }
  }, [workspaceId, entityType, entityId])

  // Fetch titles for linked entities
  useEffect(() => {
    if (!workspaceId || links.length === 0) return

    const entitiesToFetch: Array<{ type: 'Task' | 'Bug'; id: string }> = []

    for (const link of links) {
      // Determine the "other" entity in the link relative to our entity
      if (link.from_entity_id === entityId && link.from_entity_type === entityType) {
        entitiesToFetch.push({ type: link.to_entity_type, id: link.to_entity_id })
      } else {
        entitiesToFetch.push({ type: link.from_entity_type, id: link.from_entity_id })
      }
    }

    const fetchTitles = async (): Promise<void> => {
      const newTitles = new Map<string, string>()

      for (const entity of entitiesToFetch) {
        const key = `${entity.type}:${entity.id}`
        if (entityTitles.has(key)) {
          newTitles.set(key, entityTitles.get(key)!)
          continue
        }

        try {
          if (entity.type === 'Task') {
            const task = await taskService.getTask(workspaceId, entity.id)
            newTitles.set(key, task?.title ?? 'Unknown Task')
          } else {
            const bug = await bugService.getBug(workspaceId, entity.id)
            newTitles.set(key, bug?.title ?? 'Unknown Bug')
          }
        } catch {
          newTitles.set(key, entity.type === 'Task' ? 'Unknown Task' : 'Unknown Bug')
        }
      }

      setEntityTitles((prev) => {
        const merged = new Map(prev)
        for (const [k, v] of newTitles) {
          merged.set(k, v)
        }
        return merged
      })
    }

    fetchTitles()
  }, [workspaceId, links, entityType, entityId])

  async function handleRemoveLink(linkId: string): Promise<void> {
    if (!workspaceId) return

    const confirmed = window.confirm('Are you sure you want to remove this link?')
    if (!confirmed) return

    setRemovingId(linkId)
    try {
      await entityLinkService.deleteLink(workspaceId, linkId)
    } catch {
      // Link will be removed from UI by subscription
    } finally {
      setRemovingId(null)
    }
  }

  function getLinkedEntity(link: EntityLink): { type: 'Task' | 'Bug'; id: string } {
    if (link.from_entity_id === entityId && link.from_entity_type === entityType) {
      return { type: link.to_entity_type, id: link.to_entity_id }
    }
    return { type: link.from_entity_type, id: link.from_entity_id }
  }

  function getEntityTitle(type: 'Task' | 'Bug', id: string): string {
    return entityTitles.get(`${type}:${id}`) ?? 'Loading...'
  }

  function getEntityLink(type: 'Task' | 'Bug', id: string): string {
    if (type === 'Task') {
      return `/projects/${projectId}/tasks/${id}`
    }
    return `/projects/${projectId}/bugs/${id}`
  }

  const atLimit = links.length >= FIELD_LIMITS.ENTITY_LINKS_MAX

  return (
    <div className="mt-6 rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Entity Links</h2>
          <span className="text-xs text-muted-foreground">
            ({links.length}/{FIELD_LIMITS.ENTITY_LINKS_MAX})
          </span>
        </div>
        {canWrite && !atLimit && (
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Link
          </button>
        )}
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground">Loading links...</p>
      )}

      {!loading && links.length === 0 && (
        <p className="text-sm text-muted-foreground">No entity links.</p>
      )}

      {!loading && links.length > 0 && (
        <div className="space-y-1">
          {links.map((link) => {
            const linked = getLinkedEntity(link)
            const title = getEntityTitle(linked.type, linked.id)

            return (
              <div
                key={link.link_id}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/50"
              >
                {/* Relation label badge */}
                <span className="inline-flex shrink-0 items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  {link.relation_label}
                </span>

                {/* Entity type icon */}
                {linked.type === 'Bug' ? (
                  <BugIcon className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                ) : (
                  <CheckCircle className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                )}

                {/* Linked entity title with link to detail page */}
                <Link
                  to={getEntityLink(linked.type, linked.id)}
                  className="min-w-0 flex-1 truncate text-sm text-foreground hover:underline"
                >
                  {title}
                </Link>

                <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />

                {/* Bidirectional indicator */}
                {link.is_bidirectional && (
                  <span className="shrink-0 text-[10px] text-muted-foreground">bi</span>
                )}

                {/* Delete button */}
                {canWrite && (
                  <button
                    onClick={() => handleRemoveLink(link.link_id)}
                    disabled={removingId === link.link_id}
                    className="shrink-0 rounded-md p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {addOpen && (
        <AddLinkDialog
          entityType={entityType}
          entityId={entityId}
          projectId={projectId}
          existingLinkCount={links.length}
          onClose={() => setAddOpen(false)}
        />
      )}
    </div>
  )
}

// --- Add Link Dialog ---

interface AddLinkDialogProps {
  entityType: 'Task' | 'Bug'
  entityId: string
  projectId: string
  existingLinkCount: number
  onClose: () => void
}

function AddLinkDialog({
  entityType,
  entityId,
  projectId,
  existingLinkCount,
  onClose,
}: AddLinkDialogProps): JSX.Element {
  const workspaceId = useWorkspaceId()
  const [targetType, setTargetType] = useState<'Task' | 'Bug'>('Task')
  const [searchQuery, setSearchQuery] = useState('')
  const [relationLabel, setRelationLabel] = useState<string>('Related')
  const [isBidirectional, setIsBidirectional] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchResults, setSearchResults] = useState<SearchableEntity[]>([])
  const [selectedEntity, setSelectedEntity] = useState<SearchableEntity | null>(null)
  const [searching, setSearching] = useState(false)

  const fetchEntities = useCallback(
    async (type: 'Task' | 'Bug', q: string): Promise<void> => {
      if (!workspaceId) return

      setSearching(true)
      try {
        let results: SearchableEntity[] = []

        if (type === 'Task') {
          const tasks = await taskService.getProjectTasks(workspaceId, projectId)
          results = tasks
            .filter(
              (t) =>
                // Exclude the current entity if it's a Task
                !(entityType === 'Task' && t.task_id === entityId),
            )
            .map((t) => ({ id: t.task_id, type: 'Task' as const, title: t.title }))
        } else {
          const bugs = await bugService.getProjectBugs(workspaceId, projectId)
          results = bugs
            .filter(
              (b) =>
                // Exclude the current entity if it's a Bug
                !(entityType === 'Bug' && b.bug_id === entityId),
            )
            .map((b) => ({ id: b.bug_id, type: 'Bug' as const, title: b.title }))
        }

        // Filter by search query
        if (q.trim()) {
          const term = q.toLowerCase()
          results = results.filter((r) => r.title.toLowerCase().includes(term))
        }

        setSearchResults(results)
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    },
    [workspaceId, projectId, entityType, entityId],
  )

  useEffect(() => {
    fetchEntities(targetType, searchQuery)
  }, [targetType, searchQuery, fetchEntities])

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>): void {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  async function handleSubmit(): Promise<void> {
    if (!workspaceId || !selectedEntity) return

    setError('')
    setLoading(true)

    try {
      await entityLinkService.createLink(workspaceId, {
        from_entity_type: entityType,
        from_entity_id: entityId,
        to_entity_type: selectedEntity.type,
        to_entity_id: selectedEntity.id,
        relation_label: relationLabel,
        is_bidirectional: isBidirectional,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Add Entity Link</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Entity type selector */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Link to Entity Type
            </label>
            <select
              value={targetType}
              onChange={(e) => {
                setTargetType(e.target.value as 'Task' | 'Bug')
                setSelectedEntity(null)
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Task">Task</option>
              <option value="Bug">Bug</option>
            </select>
          </div>

          {/* Search input */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Search {targetType}s
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${targetType.toLowerCase()}s by title...`}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Search results */}
          <div className="max-h-40 overflow-y-auto rounded-md border border-border">
            {searching && (
              <p className="px-3 py-2 text-sm text-muted-foreground">Searching...</p>
            )}
            {!searching && searchResults.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                No {targetType.toLowerCase()}s found.
              </p>
            )}
            {!searching &&
              searchResults.map((entity) => (
                <button
                  key={entity.id}
                  type="button"
                  onClick={() => setSelectedEntity(entity)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent ${
                    selectedEntity?.id === entity.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground'
                  }`}
                >
                  {entity.type === 'Bug' ? (
                    <BugIcon className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                  ) : (
                    <CheckCircle className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                  )}
                  <span className="min-w-0 flex-1 truncate">{entity.title}</span>
                </button>
              ))}
          </div>

          {/* Selected entity display */}
          {selectedEntity && (
            <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
              <p className="text-sm text-foreground">
                Selected: <span className="font-medium">{selectedEntity.title}</span>{' '}
                <span className="text-muted-foreground">({selectedEntity.type})</span>
              </p>
            </div>
          )}

          {/* Relation label */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Relation Label
            </label>
            <select
              value={relationLabel}
              onChange={(e) => setRelationLabel(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {RELATION_LABELS.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Bidirectional toggle */}
          <div className="flex items-center gap-3">
            <input
              id="bidirectional-toggle"
              type="checkbox"
              checked={isBidirectional}
              onChange={(e) => setIsBidirectional(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
            />
            <label htmlFor="bidirectional-toggle" className="text-sm text-foreground">
              Bidirectional link (visible from both entities)
            </label>
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedEntity}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
