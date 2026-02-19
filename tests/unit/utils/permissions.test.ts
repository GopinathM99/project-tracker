import { describe, it, expect } from 'vitest'
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissions,
  type Permission,
} from '@shared/utils/permissions'

describe('permissions', () => {
  describe('Owner role', () => {
    it('has all permissions', () => {
      const allPermissions: Permission[] = [
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
      ]

      for (const permission of allPermissions) {
        expect(hasPermission('Owner', permission)).toBe(true)
      }
    })

    it('getPermissions returns 16 permissions', () => {
      const permissions = getPermissions('Owner')
      expect(permissions.size).toBe(16)
    })
  })

  describe('Member role', () => {
    it('has create/update/read for tasks, bugs, comments, and projects', () => {
      const memberPermissions: Permission[] = [
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
      ]

      for (const permission of memberPermissions) {
        expect(hasPermission('Member', permission)).toBe(true)
      }
    })

    it('has members:read', () => {
      expect(hasPermission('Member', 'members:read')).toBe(true)
    })

    it('does NOT have workspace:manage', () => {
      expect(hasPermission('Member', 'workspace:manage')).toBe(false)
    })

    it('does NOT have members:manage', () => {
      expect(hasPermission('Member', 'members:manage')).toBe(false)
    })

    it('does NOT have invites:manage', () => {
      expect(hasPermission('Member', 'invites:manage')).toBe(false)
    })

    it('getPermissions returns 13 permissions', () => {
      const permissions = getPermissions('Member')
      expect(permissions.size).toBe(13)
    })
  })

  describe('Viewer role', () => {
    it('has only read permissions', () => {
      const viewerPermissions: Permission[] = [
        'members:read',
        'projects:read',
        'tasks:read',
        'bugs:read',
        'comments:read',
      ]

      for (const permission of viewerPermissions) {
        expect(hasPermission('Viewer', permission)).toBe(true)
      }
    })

    it('does NOT have any write/manage permissions', () => {
      const nonViewerPermissions: Permission[] = [
        'workspace:manage',
        'members:manage',
        'projects:create',
        'projects:update',
        'tasks:create',
        'tasks:update',
        'bugs:create',
        'bugs:update',
        'comments:create',
        'comments:update_own',
        'invites:manage',
      ]

      for (const permission of nonViewerPermissions) {
        expect(hasPermission('Viewer', permission)).toBe(false)
      }
    })

    it('getPermissions returns 5 permissions', () => {
      const permissions = getPermissions('Viewer')
      expect(permissions.size).toBe(5)
    })
  })

  describe('hasAnyPermission', () => {
    it('returns true if at least one permission matches', () => {
      expect(
        hasAnyPermission('Viewer', ['workspace:manage', 'projects:read']),
      ).toBe(true)
    })

    it('returns false if no permissions match', () => {
      expect(
        hasAnyPermission('Viewer', ['workspace:manage', 'members:manage', 'invites:manage']),
      ).toBe(false)
    })

    it('returns false for empty permissions array', () => {
      expect(hasAnyPermission('Owner', [])).toBe(false)
    })
  })

  describe('hasAllPermissions', () => {
    it('returns true only if all permissions match', () => {
      expect(
        hasAllPermissions('Owner', ['workspace:manage', 'members:manage', 'invites:manage']),
      ).toBe(true)
    })

    it('returns false if any permission does not match', () => {
      expect(
        hasAllPermissions('Member', ['projects:create', 'workspace:manage']),
      ).toBe(false)
    })

    it('returns true for empty permissions array', () => {
      expect(hasAllPermissions('Viewer', [])).toBe(true)
    })

    it('returns true when Member has all specified permissions', () => {
      expect(
        hasAllPermissions('Member', ['tasks:create', 'tasks:update', 'tasks:read']),
      ).toBe(true)
    })
  })

  describe('getPermissions', () => {
    it('returns a ReadonlySet for Owner', () => {
      const permissions = getPermissions('Owner')
      expect(permissions).toBeInstanceOf(Set)
      expect(permissions.has('workspace:manage')).toBe(true)
      expect(permissions.has('invites:manage')).toBe(true)
    })

    it('returns a ReadonlySet for Member', () => {
      const permissions = getPermissions('Member')
      expect(permissions).toBeInstanceOf(Set)
      expect(permissions.has('tasks:create')).toBe(true)
      expect(permissions.has('workspace:manage')).toBe(false)
    })

    it('returns a ReadonlySet for Viewer', () => {
      const permissions = getPermissions('Viewer')
      expect(permissions).toBeInstanceOf(Set)
      expect(permissions.has('projects:read')).toBe(true)
      expect(permissions.has('projects:create')).toBe(false)
    })
  })
})
