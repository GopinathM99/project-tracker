import { useState, useEffect, useRef, type FormEvent } from 'react'
import { projectService } from '@/services/project-service'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { useFolders } from '@/hooks/useFolders'
import { useTags } from '@/hooks/useTags'
import { useCanWrite } from '@/hooks/usePermission'
import { FIELD_LIMITS } from '@shared/constants/validation'
import { validateProjectDates, validateFieldLength } from '@shared/utils/validation-helpers'
import type { Project } from '@shared/schemas'
import { X, Plus, Tags } from 'lucide-react'

interface EditProjectDialogProps {
  open: boolean
  onClose: () => void
  project: Project
}

function toDateInput(isoString: string): string {
  return isoString.split('T')[0]
}

function toISODateTime(dateStr: string): string {
  return `${dateStr}T00:00:00.000Z`
}

const PROJECT_STATUSES = ['Active', 'On Hold', 'Completed', 'Archived'] as const

export function EditProjectDialog({ open, onClose, project }: EditProjectDialogProps): JSX.Element | null {
  const workspaceId = useWorkspaceId()
  const { folders } = useFolders()
  const { tags: allTags } = useTags()
  const canWrite = useCanWrite()
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description)
  const [status, setStatus] = useState(project.status)
  const [startDate, setStartDate] = useState(toDateInput(project.start_date))
  const [targetEndDate, setTargetEndDate] = useState(toDateInput(project.target_end_date))
  const [folderId, setFolderId] = useState<string>(project.folder_id ?? '')
  const [tagIds, setTagIds] = useState<string[]>(project.tag_ids)
  const [showTagDropdown, setShowTagDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const tagDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setName(project.name)
      setDescription(project.description)
      setStatus(project.status)
      setStartDate(toDateInput(project.start_date))
      setTargetEndDate(toDateInput(project.target_end_date))
      setFolderId(project.folder_id ?? '')
      setTagIds(project.tag_ids)
      setShowTagDropdown(false)
      setError(null)
    }
  }, [open, project])

  // Close tag dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false)
      }
    }

    if (showTagDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showTagDropdown])

  if (!open) return null

  const projectTags = allTags.filter((t) => tagIds.includes(t.tag_id))

  // Available tags not yet assigned, scoped appropriately
  const availableTags = allTags.filter((t) => {
    if (tagIds.includes(t.tag_id)) return false
    if (t.scope === 'Global') return true
    if (t.scope === 'Project' && t.project_id === project.project_id) return true
    return false
  })

  const atTagLimit = tagIds.length >= FIELD_LIMITS.TAGS_PER_ENTITY

  function addTag(tagId: string): void {
    if (atTagLimit) return
    setTagIds((prev) => [...prev, tagId])
    setShowTagDropdown(false)
  }

  function removeTag(tagId: string): void {
    setTagIds((prev) => prev.filter((id) => id !== tagId))
  }

  function handleClose(): void {
    setError(null)
    onClose()
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>): void {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError(null)

    if (!workspaceId) {
      setError('No workspace selected')
      return
    }

    if (!name.trim()) {
      setError('Project name is required')
      return
    }

    const nameError = validateFieldLength(name.trim(), FIELD_LIMITS.TITLE_MAX, 'Project name')
    if (nameError) {
      setError(nameError)
      return
    }

    const descError = validateFieldLength(description.trim(), FIELD_LIMITS.DESCRIPTION_MAX, 'Description')
    if (descError) {
      setError(descError)
      return
    }

    if (!targetEndDate) {
      setError('Target end date is required')
      return
    }

    const dateError = validateProjectDates(startDate, targetEndDate)
    if (dateError) {
      setError(dateError)
      return
    }

    setLoading(true)

    try {
      const changes: Partial<Pick<Project, 'name' | 'description' | 'status' | 'start_date' | 'target_end_date' | 'folder_id' | 'tag_ids'>> = {}

      const trimmedName = name.trim()
      const trimmedDesc = description.trim()
      const newStartDate = toISODateTime(startDate)
      const newTargetEndDate = toISODateTime(targetEndDate)
      const newFolderId = folderId || null

      if (trimmedName !== project.name) changes.name = trimmedName
      if (trimmedDesc !== project.description) changes.description = trimmedDesc
      if (status !== project.status) changes.status = status
      if (newStartDate !== project.start_date) changes.start_date = newStartDate
      if (newTargetEndDate !== project.target_end_date) changes.target_end_date = newTargetEndDate
      if (newFolderId !== project.folder_id) changes.folder_id = newFolderId

      // Check if tag_ids changed
      const prevTagsSorted = [...project.tag_ids].sort().join(',')
      const newTagsSorted = [...tagIds].sort().join(',')
      if (prevTagsSorted !== newTagsSorted) changes.tag_ids = tagIds

      if (Object.keys(changes).length > 0) {
        await projectService.updateProject(workspaceId, project.project_id, changes)
      }

      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Edit Project</h2>
          <button
            onClick={handleClose}
            className="rounded-md px-1 py-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-project-name" className="mb-1 block text-sm font-medium text-foreground">
              Name
            </label>
            <input
              id="edit-project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={200}
              placeholder="Project name"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="edit-project-description" className="mb-1 block text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              id="edit-project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={20000}
              placeholder="Describe this project (optional)"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="edit-project-status" className="mb-1 block text-sm font-medium text-foreground">
              Status
            </label>
            <select
              id="edit-project-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Project['status'])}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Folder selection */}
          <div>
            <label htmlFor="edit-project-folder" className="mb-1 block text-sm font-medium text-foreground">
              Folder
            </label>
            <select
              id="edit-project-folder"
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">No Folder</option>
              {folders.map((folder) => (
                <option key={folder.folder_id} value={folder.folder_id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-project-start-date" className="mb-1 block text-sm font-medium text-foreground">
                Start Date
              </label>
              <input
                id="edit-project-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="edit-project-end-date" className="mb-1 block text-sm font-medium text-foreground">
                Target End Date
              </label>
              <input
                id="edit-project-end-date"
                type="date"
                value={targetEndDate}
                onChange={(e) => setTargetEndDate(e.target.value)}
                required
                min={startDate}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Tag management section */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Tags className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">Tags</label>
              <span className="text-xs text-muted-foreground">
                ({tagIds.length}/{FIELD_LIMITS.TAGS_PER_ENTITY})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {projectTags.map((tag) => (
                <span
                  key={tag.tag_id}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                  {canWrite && (
                    <button
                      type="button"
                      onClick={() => removeTag(tag.tag_id)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-black/20"
                      aria-label={`Remove tag ${tag.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}

              {tagIds.length === 0 && (
                <span className="text-xs text-muted-foreground">No tags assigned</span>
              )}

              {canWrite && !atTagLimit && (
                <div className="relative" ref={tagDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowTagDropdown(!showTagDropdown)}
                    className="inline-flex items-center gap-1 rounded-full border border-dashed border-muted-foreground/30 px-2 py-0.5 text-xs text-muted-foreground hover:border-foreground hover:text-foreground"
                  >
                    <Plus className="h-3 w-3" />
                    Add Tag
                  </button>

                  {showTagDropdown && (
                    <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-md border border-border bg-card p-1 shadow-lg">
                      {availableTags.length === 0 ? (
                        <p className="px-3 py-2 text-xs text-muted-foreground">
                          No more tags available.
                        </p>
                      ) : (
                        <div className="max-h-48 overflow-y-auto">
                          {availableTags.map((tag) => (
                            <button
                              key={tag.tag_id}
                              type="button"
                              onClick={() => addTag(tag.tag_id)}
                              className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-left text-sm hover:bg-accent"
                            >
                              <span
                                className="h-3 w-3 shrink-0 rounded-full"
                                style={{ backgroundColor: tag.color }}
                              />
                              <span className="truncate text-foreground">{tag.name}</span>
                              <span className="ml-auto text-xs text-muted-foreground">{tag.scope}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
