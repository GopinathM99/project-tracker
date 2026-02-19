import { useState, useRef, useEffect } from 'react'
import { projectService } from '@/services/project-service'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { useTags } from '@/hooks/useTags'
import { useCanWrite } from '@/hooks/usePermission'
import { FIELD_LIMITS } from '@shared/constants/validation'
import type { Project, Tag } from '@shared/schemas'
import { X, Plus, Tags } from 'lucide-react'

interface TagManagerProps {
  project: Project
  /** Called after tags are updated so parent can react */
  onTagsUpdated?: () => void
}

export function TagManager({ project, onTagsUpdated }: TagManagerProps): JSX.Element {
  const workspaceId = useWorkspaceId()
  const { tags: allTags } = useTags()
  const canWrite = useCanWrite()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  // Get the Tag objects for the project's current tag_ids
  const projectTags = allTags.filter((t) => project.tag_ids.includes(t.tag_id))

  // Available tags that are not already on this project
  // Global tags + project-scoped tags for this project
  const availableTags = allTags.filter((t) => {
    if (project.tag_ids.includes(t.tag_id)) return false
    if (t.scope === 'Global') return true
    if (t.scope === 'Project' && t.project_id === project.project_id) return true
    return false
  })

  const atLimit = project.tag_ids.length >= FIELD_LIMITS.TAGS_PER_ENTITY

  async function addTag(tagId: string): Promise<void> {
    if (!workspaceId || atLimit) return

    const updatedTagIds = [...project.tag_ids, tagId]
    await projectService.updateProject(workspaceId, project.project_id, {
      tag_ids: updatedTagIds,
    })
    onTagsUpdated?.()
    setShowDropdown(false)
  }

  async function removeTag(tagId: string): Promise<void> {
    if (!workspaceId) return

    const updatedTagIds = project.tag_ids.filter((id) => id !== tagId)
    await projectService.updateProject(workspaceId, project.project_id, {
      tag_ids: updatedTagIds,
    })
    onTagsUpdated?.()
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Tags className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">Tags</span>
        <span className="text-xs text-muted-foreground">
          ({project.tag_ids.length}/{FIELD_LIMITS.TAGS_PER_ENTITY})
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
                onClick={() => removeTag(tag.tag_id)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-black/20"
                aria-label={`Remove tag ${tag.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}

        {projectTags.length === 0 && (
          <span className="text-xs text-muted-foreground">No tags assigned</span>
        )}

        {canWrite && !atLimit && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-muted-foreground/30 px-2 py-0.5 text-xs text-muted-foreground hover:border-foreground hover:text-foreground"
            >
              <Plus className="h-3 w-3" />
              Add Tag
            </button>

            {showDropdown && (
              <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-md border border-border bg-card p-1 shadow-lg">
                {availableTags.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-muted-foreground">
                    No available tags. Create tags from the project list page.
                  </p>
                ) : (
                  <div className="max-h-48 overflow-y-auto">
                    {availableTags.map((tag) => (
                      <button
                        key={tag.tag_id}
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
  )
}
