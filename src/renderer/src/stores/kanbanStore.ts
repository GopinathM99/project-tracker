import { create } from 'zustand'

export interface KanbanFilters {
  owner?: string | null
  priority?: string[]
  projectId?: string
  dueDateWindow?: 'all' | 'this_week' | 'this_month'
}

interface KanbanState {
  filters: KanbanFilters
  setFilters: (filters: Partial<KanbanFilters>) => void
  clearFilters: () => void
}

export const useKanbanStore = create<KanbanState>((set) => ({
  filters: {
    priority: [],
    dueDateWindow: 'all',
  },
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  clearFilters: () =>
    set({
      filters: {
        priority: [],
        dueDateWindow: 'all',
      },
    }),
}))
