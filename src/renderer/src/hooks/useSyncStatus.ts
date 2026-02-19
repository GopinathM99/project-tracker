import { useEffect } from 'react'
import { waitForPendingWrites, onSnapshotsInSync } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import { useSyncStore } from '@/stores/syncStore'
import { generateTimestamp } from '@shared/utils'
import { SYNC_CONFIG } from '@shared/constants/sync'

/**
 * Monitors online/offline status and updates the sync store using real
 * Firestore sync detection instead of a timeout hack.
 * NFR-005/NFR-006: Offline reliability + auto-sync on reconnect.
 * NFR-030: Sync-state indicators refresh within 5 seconds of connectivity changes.
 */
export function useSyncStatus(): void {
  const setStatus = useSyncStore((s) => s.setStatus)
  const setLastSynced = useSyncStore((s) => s.setLastSynced)

  useEffect(() => {
    // Set initial status based on navigator.onLine
    if (navigator.onLine) {
      setStatus('in-sync')
      setLastSynced(generateTimestamp())
    } else {
      setStatus('offline')
    }

    let reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null

    async function handleOnline(): Promise<void> {
      setStatus('syncing')

      // Brief debounce to let Firestore reconnect
      reconnectTimeoutId = setTimeout(async () => {
        try {
          // Race: wait for pending writes or timeout
          const pendingWritesPromise = waitForPendingWrites(db)
          const timeoutPromise = new Promise<'timeout'>((resolve) =>
            setTimeout(() => resolve('timeout'), SYNC_CONFIG.PENDING_WRITES_TIMEOUT_MS),
          )

          const result = await Promise.race([pendingWritesPromise, timeoutPromise])

          if (result === 'timeout') {
            setStatus('sync-error')
          } else {
            setStatus('in-sync')
            setLastSynced(generateTimestamp())
          }
        } catch {
          setStatus('sync-error')
        }
      }, SYNC_CONFIG.RECONNECT_DEBOUNCE_MS)
    }

    function handleOffline(): void {
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId)
        reconnectTimeoutId = null
      }
      setStatus('offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Continuous sync detection via Firestore snapshots-in-sync listener
    const unsubscribeSnapshotsInSync = onSnapshotsInSync(db, () => {
      if (navigator.onLine) {
        setStatus('in-sync')
        setLastSynced(generateTimestamp())
      }
    })

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      unsubscribeSnapshotsInSync()
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId)
      }
    }
  }, [setStatus, setLastSynced])
}
