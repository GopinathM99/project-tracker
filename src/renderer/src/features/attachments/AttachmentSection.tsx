import { useState, useRef } from 'react'
import { useAttachments } from '@/hooks/useAttachments'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { useCanWrite } from '@/hooks/usePermission'
import { attachmentService } from '@/services/attachment-service'
import { FIELD_LIMITS } from '@shared/constants/validation'
import { AttachmentItem } from './AttachmentItem'
import { Paperclip, Plus } from 'lucide-react'

interface AttachmentSectionProps {
  entityType: 'Task' | 'Bug' | 'Project'
  entityId: string
}

export function AttachmentSection({
  entityType,
  entityId,
}: AttachmentSectionProps): JSX.Element {
  const workspaceId = useWorkspaceId()
  const canWrite = useCanWrite()
  const { attachments, loading } = useAttachments(entityType, entityId)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const atLimit = attachments.length >= FIELD_LIMITS.ATTACHMENTS_PER_ENTITY
  const nearLimit =
    attachments.length >= FIELD_LIMITS.ATTACHMENTS_PER_ENTITY - 3

  async function handleFileSelect(
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const files = e.target.files
    if (!files || files.length === 0 || !workspaceId) return

    setError(null)

    const remainingSlots =
      FIELD_LIMITS.ATTACHMENTS_PER_ENTITY - attachments.length
    if (files.length > remainingSlots) {
      setError(
        `Can only attach ${remainingSlots} more file${remainingSlots === 1 ? '' : 's'} (limit: ${FIELD_LIMITS.ATTACHMENTS_PER_ENTITY} per entity)`,
      )
      return
    }

    setUploading(true)

    try {
      for (const file of Array.from(files)) {
        // If Electron IPC is available, use the native file dialog result
        // Otherwise, store metadata with the file name as storage path
        let storagePath = file.name

        // Attempt to copy the file using Electron IPC if available
        if (window.electronAPI?.copyFile && 'path' in file && (file as File & { path: string }).path) {
          try {
            const destDir = `${workspaceId}/${entityType}/${entityId}`
            storagePath = await window.electronAPI.copyFile(
              (file as File & { path: string }).path,
              destDir,
              file.name,
            )
          } catch {
            // If copy fails, fall back to storing the file name
            storagePath = file.name
          }
        }

        await attachmentService.createAttachment(
          workspaceId,
          entityType,
          entityId,
          {
            fileName: file.name,
            mimeType: file.type || 'application/octet-stream',
            fileSizeBytes: file.size,
            storagePath,
          },
        )
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to attach file',
      )
    } finally {
      setUploading(false)
      // Reset the file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  async function handleRemove(attachmentId: string): Promise<void> {
    if (!workspaceId) return

    const confirmed = window.confirm(
      'Are you sure you want to remove this attachment?',
    )
    if (!confirmed) return

    try {
      await attachmentService.removeAttachment(workspaceId, attachmentId)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to remove attachment',
      )
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">
            Attachments
          </h2>
          <span className="text-xs text-muted-foreground">
            ({attachments.length})
          </span>
        </div>

        {canWrite && !atLimit && (
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
            <Plus className="h-3.5 w-3.5" />
            Attach File
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {error && (
        <div className="mb-3 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {nearLimit && !atLimit && (
        <div className="mb-3 rounded-md border border-yellow-500/50 bg-yellow-500/10 px-3 py-2">
          <p className="text-xs text-yellow-600">
            Approaching attachment limit ({attachments.length}/
            {FIELD_LIMITS.ATTACHMENTS_PER_ENTITY})
          </p>
        </div>
      )}

      {atLimit && (
        <div className="mb-3 rounded-md border border-yellow-500/50 bg-yellow-500/10 px-3 py-2">
          <p className="text-xs text-yellow-600">
            Attachment limit reached ({FIELD_LIMITS.ATTACHMENTS_PER_ENTITY}/
            {FIELD_LIMITS.ATTACHMENTS_PER_ENTITY})
          </p>
        </div>
      )}

      {uploading && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground">Uploading...</p>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading attachments...</p>
      ) : attachments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No attachments</p>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <AttachmentItem
              key={attachment.attachment_id}
              attachment={attachment}
              onRemove={
                canWrite
                  ? () => handleRemove(attachment.attachment_id)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
