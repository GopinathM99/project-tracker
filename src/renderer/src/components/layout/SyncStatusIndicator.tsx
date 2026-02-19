import { useMemo } from 'react'
import { useSyncStore } from '@/stores/syncStore'

const statusLabels: Record<string, string> = {
  offline: 'Offline',
  syncing: 'Syncing...',
  'in-sync': 'Synced',
  'sync-error': 'Sync Error',
}

const statusColors: Record<string, string> = {
  offline: 'bg-muted-foreground',
  syncing: 'bg-yellow-500',
  'in-sync': 'bg-green-500',
  'sync-error': 'bg-destructive',
}

function formatLastSynced(timestamp: string | null): string | null {
  if (!timestamp) return null

  const syncedDate = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - syncedDate.getTime()
  const diffMinutes = Math.floor(diffMs / 60_000)

  if (diffMinutes < 1) return 'just now'
  if (diffMinutes === 1) return '1 minute ago'
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours === 1) return '1 hour ago'
  if (diffHours < 24) return `${diffHours} hours ago`

  return syncedDate.toLocaleDateString()
}

export function SyncStatusIndicator(): JSX.Element {
  const status = useSyncStore((s) => s.status)
  const lastSyncedAt = useSyncStore((s) => s.lastSyncedAt)

  const lastSyncedLabel = useMemo(() => formatLastSynced(lastSyncedAt), [lastSyncedAt])

  return (
    <div role="status" aria-live="polite" className="flex items-center gap-2 border-t border-border px-4 py-1.5 text-xs text-muted-foreground">
      <span className={`h-2 w-2 rounded-full ${statusColors[status]}`} />
      <span>{statusLabels[status]}</span>
      {lastSyncedLabel && (
        <>
          <span className="text-muted-foreground/50">·</span>
          <span>Last synced: {lastSyncedLabel}</span>
        </>
      )}
    </div>
  )
}
