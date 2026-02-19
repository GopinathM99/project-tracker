import { create } from 'zustand'
import type { Bug } from '@shared/schemas'

export type BugSortField = 'title' | 'status' | 'severity' | 'priority' | 'reported_at' | 'target_fix_date' | 'created_at'
export type SortOrder = 'asc' | 'desc'

export interface BugFilters {
  status?: string[]
  severity?: string[]
  priority?: string[]
  assignee?: string | null
  search?: string
}

interface BugState {
  bugs: Bug[]
  currentBug: Bug | null
  loading: boolean
  filters: BugFilters
  sortField: BugSortField
  sortOrder: SortOrder
  setBugs: (bugs: Bug[]) => void
  setCurrentBug: (bug: Bug | null) => void
  updateBug: (bugId: string, changes: Partial<Bug>) => void
  removeBug: (bugId: string) => void
  setLoading: (loading: boolean) => void
  setFilters: (filters: BugFilters) => void
  setSorting: (field: BugSortField, order: SortOrder) => void
  clear: () => void
}

export const useBugStore = create<BugState>((set) => ({
  bugs: [],
  currentBug: null,
  loading: false,
  filters: {},
  sortField: 'created_at',
  sortOrder: 'asc',
  setBugs: (bugs) => set({ bugs }),
  setCurrentBug: (currentBug) => set({ currentBug }),
  updateBug: (bugId, changes) =>
    set((state) => ({
      bugs: state.bugs.map((b) =>
        b.bug_id === bugId ? { ...b, ...changes } : b
      ),
      currentBug:
        state.currentBug?.bug_id === bugId
          ? { ...state.currentBug, ...changes }
          : state.currentBug,
    })),
  removeBug: (bugId) =>
    set((state) => ({
      bugs: state.bugs.filter((b) => b.bug_id !== bugId),
      currentBug:
        state.currentBug?.bug_id === bugId ? null : state.currentBug,
    })),
  setLoading: (loading) => set({ loading }),
  setFilters: (filters) => set({ filters }),
  setSorting: (sortField, sortOrder) => set({ sortField, sortOrder }),
  clear: () => set({ bugs: [], currentBug: null, loading: false, filters: {}, sortField: 'created_at', sortOrder: 'asc' }),
}))
