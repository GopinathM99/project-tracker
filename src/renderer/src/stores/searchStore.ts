import { create } from 'zustand'

interface SearchState {
  query: string
  setQuery: (q: string) => void
  entityFilter: 'all' | 'project' | 'task' | 'bug'
  setEntityFilter: (f: 'all' | 'project' | 'task' | 'bug') => void
  statusFilter: string | null
  setStatusFilter: (s: string | null) => void
  clear: () => void
}

export const useSearchStore = create<SearchState>()((set) => ({
  query: '',
  setQuery: (query) => set({ query }),
  entityFilter: 'all',
  setEntityFilter: (entityFilter) => set({ entityFilter }),
  statusFilter: null,
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  clear: () => set({ query: '', entityFilter: 'all', statusFilter: null }),
}))
