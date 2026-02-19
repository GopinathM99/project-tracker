import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  currentWorkspaceId: string | null
  setCurrentWorkspace: (id: string) => void
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      currentWorkspaceId: null,
      setCurrentWorkspace: (id) => set({ currentWorkspaceId: id }),
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
    }),
    { name: 'app-store' },
  ),
)
