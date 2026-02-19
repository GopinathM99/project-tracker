import { describe, it, expect, beforeEach } from 'vitest'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import type { Workspace, WorkspaceMember } from '@shared/schemas'

const mockWorkspace: Workspace = {
  workspace_id: 'ws-123',
  name: 'Test Workspace',
  slug: 'test-workspace',
  owner_user_id: 'user-1',
  plan_tier: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

const mockMembership: WorkspaceMember = {
  membership_id: 'mem-456',
  workspace_id: 'ws-123',
  user_id: 'user-1',
  role: 'Owner',
  status: 'Active',
  invited_by: null,
  invited_at: null,
  accepted_at: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

describe('workspaceStore', () => {
  beforeEach(() => {
    useWorkspaceStore.getState().clear()
  })

  it('has correct initial state', () => {
    const state = useWorkspaceStore.getState()
    expect(state.workspace).toBeNull()
    expect(state.membership).toBeNull()
    expect(state.loading).toBe(false)
  })

  it('setWorkspace updates the workspace', () => {
    useWorkspaceStore.getState().setWorkspace(mockWorkspace)
    expect(useWorkspaceStore.getState().workspace).toEqual(mockWorkspace)
  })

  it('setMembership updates the membership', () => {
    useWorkspaceStore.getState().setMembership(mockMembership)
    expect(useWorkspaceStore.getState().membership).toEqual(mockMembership)
  })

  it('setLoading updates the loading state', () => {
    useWorkspaceStore.getState().setLoading(true)
    expect(useWorkspaceStore.getState().loading).toBe(true)
  })

  it('clear resets all state', () => {
    useWorkspaceStore.getState().setWorkspace(mockWorkspace)
    useWorkspaceStore.getState().setMembership(mockMembership)
    useWorkspaceStore.getState().setLoading(true)

    useWorkspaceStore.getState().clear()

    const state = useWorkspaceStore.getState()
    expect(state.workspace).toBeNull()
    expect(state.membership).toBeNull()
    expect(state.loading).toBe(false)
  })

  it('setWorkspace to null clears the workspace', () => {
    useWorkspaceStore.getState().setWorkspace(mockWorkspace)
    useWorkspaceStore.getState().setWorkspace(null)
    expect(useWorkspaceStore.getState().workspace).toBeNull()
  })
})
