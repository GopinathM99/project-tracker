import { create } from 'zustand'
import type { Workspace, WorkspaceMember } from '@shared/schemas'

interface WorkspaceState {
  workspace: Workspace | null
  membership: WorkspaceMember | null
  loading: boolean
  setWorkspace: (workspace: Workspace | null) => void
  setMembership: (membership: WorkspaceMember | null) => void
  setLoading: (loading: boolean) => void
  clear: () => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspace: null,
  membership: null,
  loading: false,
  setWorkspace: (workspace) => set({ workspace }),
  setMembership: (membership) => set({ membership }),
  setLoading: (loading) => set({ loading }),
  clear: () => set({ workspace: null, membership: null, loading: false }),
}))
