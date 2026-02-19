/**
 * Conflict resolution strategy for multi-device edits.
 * NFR-007: Last-Write-Wins (LWW) as MVP default.
 *
 * Firestore natively implements LWW at the field level.
 * The last setDoc/updateDoc call wins for each field.
 * Timestamps (updated_at) are set client-side, so the most recent
 * write from any device will persist.
 */
export const SYNC_CONFIG = {
  CONFLICT_STRATEGY: 'last-write-wins' as const,
  /** Delay (ms) after coming online before checking pending writes */
  RECONNECT_DEBOUNCE_MS: 500,
  /** Max time (ms) to wait for pending writes before showing sync-error */
  PENDING_WRITES_TIMEOUT_MS: 30_000,
} as const
