import { useState, type FormEvent } from 'react'
import { tagService } from '@/services/tag-service'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { FIELD_LIMITS } from '@shared/constants/validation'
import { X } from 'lucide-react'

interface CreateTagDialogProps {
  open: boolean
  onClose: () => void
  /** If provided, the tag will be project-scoped by default */
  projectId?: string
}

const PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#6b7280',
] as const

export function CreateTagDialog({ open, onClose, projectId }: CreateTagDialogProps): JSX.Element | null {
  const workspaceId = useWorkspaceId()
  const [name, setName] = useState('')
  const [color, setColor] = useState<string>(PRESET_COLORS[4])
  const [scope, setScope] = useState<'Global' | 'Project'>(projectId ? 'Project' : 'Global')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  function resetForm(): void {
    setName('')
    setColor(PRESET_COLORS[4])
    setScope(projectId ? 'Project' : 'Global')
    setError(null)
  }

  function handleClose(): void {
    resetForm()
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
      setError('Tag name is required')
      return
    }

    setLoading(true)

    try {
      await tagService.createTag(workspaceId, {
        name: name.trim(),
        color,
        scope,
        project_id: scope === 'Project' ? (projectId ?? null) : null,
      })
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tag')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Create Tag</h2>
          <button
            onClick={handleClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
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
            <label htmlFor="tag-name" className="mb-1 block text-sm font-medium text-foreground">
              Name <span className="text-destructive">*</span>
            </label>
            <input
              id="tag-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={FIELD_LIMITS.TITLE_MAX}
              placeholder="Tag name"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`h-8 w-8 rounded-full border-2 transition-transform ${
                    color === presetColor
                      ? 'scale-110 border-foreground'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: presetColor }}
                  aria-label={`Select color ${presetColor}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="tag-scope" className="mb-1 block text-sm font-medium text-foreground">
              Scope
            </label>
            <select
              id="tag-scope"
              value={scope}
              onChange={(e) => setScope(e.target.value as 'Global' | 'Project')}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Global">Global (available across all projects)</option>
              <option value="Project">Project (scoped to one project)</option>
            </select>
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
              {loading ? 'Creating...' : 'Create Tag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
