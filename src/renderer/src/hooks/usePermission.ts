import { useWorkspaceStore } from '@/stores/workspaceStore'
import { hasPermission, type Permission, type MemberRole } from '@shared/utils/permissions'

/**
 * Check if the current user has a specific permission in the active workspace.
 * Returns false if no membership is loaded.
 */
export function usePermission(permission: Permission): boolean {
  const membership = useWorkspaceStore((s) => s.membership)
  if (!membership) return false
  return hasPermission(membership.role as MemberRole, permission)
}

/**
 * Check if the current user can write (create/update) in the active workspace.
 * Returns true for Owner and Member roles, false for Viewer.
 */
export function useCanWrite(): boolean {
  const membership = useWorkspaceStore((s) => s.membership)
  if (!membership) return false
  return membership.role === 'Owner' || membership.role === 'Member'
}

/**
 * Check if the current user is the workspace Owner.
 */
export function useIsOwner(): boolean {
  const membership = useWorkspaceStore((s) => s.membership)
  if (!membership) return false
  return membership.role === 'Owner'
}
