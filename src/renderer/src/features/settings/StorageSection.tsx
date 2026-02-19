import { useState, useEffect } from 'react'
import { HardDrive, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import { FIELD_LIMITS } from '@shared/constants/validation'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firestore'

interface EntityCount {
  label: string
  count: number
  threshold: number
}

export default function StorageSection(): JSX.Element {
  const workspaceId = useWorkspaceId()
  const [counts, setCounts] = useState<EntityCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCounts(): Promise<void> {
      if (!workspaceId) return
      setLoading(true)
      try {
        const collections = [
          { name: 'projects', label: 'Projects', threshold: 500 },
          { name: 'tasks', label: 'Tasks', threshold: 5000 },
          { name: 'bugs', label: 'Bugs', threshold: 1000 },
          { name: 'comments', label: 'Comments', threshold: 10000 },
          { name: 'attachments', label: 'Attachments', threshold: 500 },
        ]

        const results: EntityCount[] = []

        for (const col of collections) {
          try {
            const snap = await getDocs(
              collection(db, 'workspaces', workspaceId, col.name),
            )
            results.push({
              label: col.label,
              count: snap.size,
              threshold: col.threshold,
            })
          } catch {
            results.push({ label: col.label, count: 0, threshold: col.threshold })
          }
        }

        setCounts(results)
      } catch {
        // Error handling
      } finally {
        setLoading(false)
      }
    }

    loadCounts()
  }, [workspaceId])

  const hasWarnings = counts.some((c) => c.count >= c.threshold)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Storage</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View entity counts and storage usage for your workspace.
        </p>
      </div>

      {/* Warning banner */}
      {hasWarnings && (
        <div className="flex items-center gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <span className="text-sm text-yellow-600 dark:text-yellow-400">
            Some entity counts are approaching or have exceeded recommended thresholds.
          </span>
        </div>
      )}

      {/* Entity counts */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-medium text-foreground">Entity Counts</h2>

        {loading ? (
          <div className="py-4 text-center text-sm text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-4">
            {counts.map((entity) => {
              const percentage = Math.min(100, (entity.count / entity.threshold) * 100)
              const isOverThreshold = entity.count >= entity.threshold

              return (
                <div key={entity.label}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-foreground">{entity.label}</span>
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isOverThreshold ? 'text-destructive' : 'text-muted-foreground',
                      )}
                    >
                      {entity.count.toLocaleString()} / {entity.threshold.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        isOverThreshold
                          ? 'bg-destructive'
                          : percentage > 75
                            ? 'bg-yellow-500'
                            : 'bg-primary',
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Storage policies */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-medium text-foreground">Storage Policies</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Attachments per entity</span>
            <span className="font-medium text-foreground">{FIELD_LIMITS.ATTACHMENTS_PER_ENTITY}</span>
          </div>
          <div className="flex justify-between">
            <span>Tags per entity</span>
            <span className="font-medium text-foreground">{FIELD_LIMITS.TAGS_PER_ENTITY}</span>
          </div>
          <div className="flex justify-between">
            <span>Trash auto-purge after</span>
            <span className="font-medium text-foreground">{FIELD_LIMITS.TRASH_PURGE_DAYS} days</span>
          </div>
          <div className="flex justify-between">
            <span>Bulk action max items</span>
            <span className="font-medium text-foreground">{FIELD_LIMITS.BULK_ACTION_MAX}</span>
          </div>
          <div className="flex justify-between">
            <span>Max subtask depth</span>
            <span className="font-medium text-foreground">{FIELD_LIMITS.SUBTASK_DEPTH_MAX}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
