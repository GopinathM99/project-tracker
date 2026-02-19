export type MemberRole = 'Owner' | 'Member' | 'Viewer'

export type Permission =
  | 'workspace:manage'
  | 'members:manage'
  | 'members:read'
  | 'projects:create'
  | 'projects:update'
  | 'projects:read'
  | 'tasks:create'
  | 'tasks:update'
  | 'tasks:read'
  | 'bugs:create'
  | 'bugs:update'
  | 'bugs:read'
  | 'comments:create'
  | 'comments:update_own'
  | 'comments:read'
  | 'invites:manage'

const PERMISSION_MATRIX: Record<MemberRole, Set<Permission>> = {
  Owner: new Set([
    'workspace:manage',
    'members:manage',
    'members:read',
    'projects:create',
    'projects:update',
    'projects:read',
    'tasks:create',
    'tasks:update',
    'tasks:read',
    'bugs:create',
    'bugs:update',
    'bugs:read',
    'comments:create',
    'comments:update_own',
    'comments:read',
    'invites:manage',
  ]),
  Member: new Set([
    'members:read',
    'projects:create',
    'projects:update',
    'projects:read',
    'tasks:create',
    'tasks:update',
    'tasks:read',
    'bugs:create',
    'bugs:update',
    'bugs:read',
    'comments:create',
    'comments:update_own',
    'comments:read',
  ]),
  Viewer: new Set([
    'members:read',
    'projects:read',
    'tasks:read',
    'bugs:read',
    'comments:read',
  ]),
}

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: MemberRole, permission: Permission): boolean {
  return PERMISSION_MATRIX[role].has(permission)
}

/**
 * Check if a role has at least one of the given permissions.
 */
export function hasAnyPermission(role: MemberRole, permissions: Permission[]): boolean {
  const rolePermissions = PERMISSION_MATRIX[role]
  return permissions.some((p) => rolePermissions.has(p))
}

/**
 * Check if a role has all of the given permissions.
 */
export function hasAllPermissions(role: MemberRole, permissions: Permission[]): boolean {
  const rolePermissions = PERMISSION_MATRIX[role]
  return permissions.every((p) => rolePermissions.has(p))
}

/**
 * Get the full set of permissions for a role.
 */
export function getPermissions(role: MemberRole): ReadonlySet<Permission> {
  return PERMISSION_MATRIX[role]
}
