import { create } from 'zustand'
import type { Folder } from '@shared/schemas'

interface FolderState {
  folders: Folder[]
  loading: boolean
  collapsedFolderIds: Set<string>
  setFolders: (folders: Folder[]) => void
  setLoading: (loading: boolean) => void
  toggleCollapsed: (folderId: string) => void
  isCollapsed: (folderId: string) => boolean
  clear: () => void
}

export const useFolderStore = create<FolderState>((set, get) => ({
  folders: [],
  loading: false,
  collapsedFolderIds: new Set<string>(),
  setFolders: (folders) => set({ folders }),
  setLoading: (loading) => set({ loading }),
  toggleCollapsed: (folderId) =>
    set((state) => {
      const next = new Set(state.collapsedFolderIds)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return { collapsedFolderIds: next }
    }),
  isCollapsed: (folderId) => get().collapsedFolderIds.has(folderId),
  clear: () => set({ folders: [], loading: false, collapsedFolderIds: new Set() }),
}))
