import { create } from 'zustand'
import type { Tag } from '@shared/schemas'

interface TagState {
  tags: Tag[]
  loading: boolean
  setTags: (tags: Tag[]) => void
  setLoading: (loading: boolean) => void
  clear: () => void
}

export const useTagStore = create<TagState>((set) => ({
  tags: [],
  loading: false,
  setTags: (tags) => set({ tags }),
  setLoading: (loading) => set({ loading }),
  clear: () => set({ tags: [], loading: false }),
}))
