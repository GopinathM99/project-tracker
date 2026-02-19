import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useAppStore } from '@/stores/appStore'
import type { Workspace, WorkspaceMember } from '@shared/schemas'

/**
 * Get the current workspace and membership from the store.
 * Throws if accessed outside of WorkspaceGuard (workspace should always be loaded).
 */
export function useWorkspace(): { workspace: Workspace; membership: WorkspaceMember } {
  const workspace = useWorkspaceStore((s) => s.workspace)
  const membership = useWorkspaceStore((s) => s.membership)

  if (!workspace || !membership) {
    throw new Error('useWorkspace must be used within a WorkspaceGuard')
  }

  return { workspace, membership }
}

/**
 * Get the current workspace ID from the app store.
 * Returns null if no workspace is selected.
 */
export function useWorkspaceId(): string | null {
  return useAppStore((s) => s.currentWorkspaceId)
}
