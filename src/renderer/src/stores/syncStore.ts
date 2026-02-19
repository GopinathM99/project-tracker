import { create } from 'zustand'
import type { SyncStatus } from '@shared/constants/statuses'

interface SyncState {
  status: SyncStatus
  lastSyncedAt: string | null
  pendingWrites: number
  setStatus: (status: SyncStatus) => void
  setLastSynced: (timestamp: string) => void
  setPendingWrites: (count: number) => void
}

export const useSyncStore = create<SyncState>((set) => ({
  status: navigator.onLine ? 'in-sync' : 'offline',
  lastSyncedAt: null,
  pendingWrites: 0,
  setStatus: (status) => set({ status }),
  setLastSynced: (timestamp) => set({ lastSyncedAt: timestamp }),
  setPendingWrites: (count) => set({ pendingWrites: count }),
}))
