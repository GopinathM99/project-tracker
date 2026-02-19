import { useState, type FormEvent } from 'react'
import { folderService } from '@/services/folder-service'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { useFolders } from '@/hooks/useFolders'
import { FIELD_LIMITS } from '@shared/constants/validation'
import { X } from 'lucide-react'
import type { Folder } from '@shared/schemas'

interface CreateFolderDialogProps {
  open: boolean
  onClose: () => void
}

/**
 * Calculate the depth of a folder in the hierarchy.
 * Root-level folders have depth 1.
 */
function getFolderDepth(folderId: string, folders: Folder[]): number {
  let depth = 1
  let current = folders.find((f) => f.folder_id === folderId)
  while (current?.parent_folder_id) {
    depth++
    current = folders.find((f) => f.folder_id === current!.parent_folder_id)
  }
  return depth
}

export function CreateFolderDialog({ open, onClose }: CreateFolderDialogProps): JSX.Element | null {
  const workspaceId = useWorkspaceId()
  const { folders } = useFolders()
  const [name, setName] = useState('')
  const [parentFolderId, setParentFolderId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  // Filter folders that can be parents (depth < FOLDER_DEPTH_MAX)
  const availableParents = folders.filter((f) => {
    return getFolderDepth(f.folder_id, folders) < FIELD_LIMITS.FOLDER_DEPTH_MAX
  })

  function resetForm(): void {
    setName('')
    setParentFolderId('')
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
      setError('Folder name is required')
      return
    }

    setLoading(true)

    try {
      await folderService.createFolder(workspaceId, {
        name: name.trim(),
        parent_folder_id: parentFolderId || null,
        sort_order: folders.length,
      })
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create folder')
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
          <h2 className="text-lg font-semibold text-foreground">Create Folder</h2>
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
            <label htmlFor="folder-name" className="mb-1 block text-sm font-medium text-foreground">
              Name <span className="text-destructive">*</span>
            </label>
            <input
              id="folder-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={FIELD_LIMITS.TITLE_MAX}
              placeholder="Folder name"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="folder-parent" className="mb-1 block text-sm font-medium text-foreground">
              Parent Folder (optional)
            </label>
            <select
              id="folder-parent"
              value={parentFolderId}
              onChange={(e) => setParentFolderId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">No Parent (Root Level)</option>
              {availableParents.map((folder) => (
                <option key={folder.folder_id} value={folder.folder_id}>
                  {folder.name}
                </option>
              ))}
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
              {loading ? 'Creating...' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
