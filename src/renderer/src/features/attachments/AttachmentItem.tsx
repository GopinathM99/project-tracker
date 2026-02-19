import type { Attachment } from '@shared/schemas'
import { Paperclip, FileText, Image, Trash2 } from 'lucide-react'

interface AttachmentItemProps {
  attachment: Attachment
  onRemove?: () => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString()
}

function getFileIcon(mimeType: string): JSX.Element {
  if (mimeType.startsWith('image/')) {
    return <Image className="h-4 w-4 shrink-0 text-muted-foreground" />
  }
  if (
    mimeType.startsWith('text/') ||
    mimeType === 'application/pdf' ||
    mimeType.includes('document') ||
    mimeType.includes('spreadsheet')
  ) {
    return <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
  }
  return <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
}

export function AttachmentItem({
  attachment,
  onRemove,
}: AttachmentItemProps): JSX.Element {
  async function handleOpen(): Promise<void> {
    if (
      attachment.storage_provider === 'Local' &&
      window.electronAPI?.shellOpenPath
    ) {
      await window.electronAPI.shellOpenPath(attachment.storage_path)
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2">
      {getFileIcon(attachment.mime_type)}

      <button
        onClick={handleOpen}
        className="min-w-0 flex-1 text-left"
        title={`Open ${attachment.file_name}`}
      >
        <p className="truncate text-sm text-foreground hover:underline">
          {attachment.file_name}
        </p>
      </button>

      <span className="shrink-0 text-xs text-muted-foreground">
        {formatFileSize(attachment.file_size_bytes)}
      </span>

      <span className="shrink-0 text-xs text-muted-foreground">
        {formatDate(attachment.uploaded_at)}
      </span>

      {onRemove && (
        <button
          onClick={onRemove}
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          title="Remove attachment"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
