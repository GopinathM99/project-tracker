import { describe, it, expect, beforeEach } from 'vitest'
import { useBugStore } from '@/stores/bugStore'
import type { Bug } from '@shared/schemas'

const mockBug: Bug = {
  bug_id: 'bug-1',
  workspace_id: 'ws-1',
  project_id: 'proj-1',
  title: 'Test Bug',
  description: 'A test bug',
  status: 'New',
  severity: 'Medium',
  priority: 'Medium',
  reporter: 'user-1',
  assignee: null,
  environment: '',
  steps_to_reproduce: '',
  expected_result: '',
  actual_result: '',
  reported_at: '2026-01-01T00:00:00.000Z',
  target_fix_date: null,
  resolved_at: null,
  tag_ids: [],
  deleted_at: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

const mockBug2: Bug = {
  ...mockBug,
  bug_id: 'bug-2',
  title: 'Second Bug',
}

describe('bugStore', () => {
  beforeEach(() => {
    useBugStore.getState().clear()
  })

  it('has correct initial state', () => {
    const state = useBugStore.getState()
    expect(state.bugs).toEqual([])
    expect(state.currentBug).toBeNull()
    expect(state.loading).toBe(false)
    expect(state.filters).toEqual({})
    expect(state.sortField).toBe('created_at')
    expect(state.sortOrder).toBe('asc')
  })

  it('setBugs updates the bugs array', () => {
    useBugStore.getState().setBugs([mockBug, mockBug2])
    expect(useBugStore.getState().bugs).toEqual([mockBug, mockBug2])
  })

  it('setCurrentBug updates currentBug', () => {
    useBugStore.getState().setCurrentBug(mockBug)
    expect(useBugStore.getState().currentBug).toEqual(mockBug)
  })

  it('setCurrentBug to null clears currentBug', () => {
    useBugStore.getState().setCurrentBug(mockBug)
    useBugStore.getState().setCurrentBug(null)
    expect(useBugStore.getState().currentBug).toBeNull()
  })

  it('updateBug updates a bug in the array', () => {
    useBugStore.getState().setBugs([mockBug, mockBug2])
    useBugStore.getState().updateBug('bug-1', { title: 'Updated Title' })

    const bugs = useBugStore.getState().bugs
    expect(bugs[0].title).toBe('Updated Title')
    expect(bugs[1].title).toBe('Second Bug')
  })

  it('updateBug also updates currentBug if it matches', () => {
    useBugStore.getState().setBugs([mockBug])
    useBugStore.getState().setCurrentBug(mockBug)
    useBugStore.getState().updateBug('bug-1', { title: 'Updated Title' })

    expect(useBugStore.getState().currentBug?.title).toBe('Updated Title')
  })

  it('updateBug does not affect currentBug if it does not match', () => {
    useBugStore.getState().setBugs([mockBug, mockBug2])
    useBugStore.getState().setCurrentBug(mockBug)
    useBugStore.getState().updateBug('bug-2', { title: 'Updated Second' })

    expect(useBugStore.getState().currentBug?.title).toBe('Test Bug')
  })

  it('removeBug removes from the array', () => {
    useBugStore.getState().setBugs([mockBug, mockBug2])
    useBugStore.getState().removeBug('bug-1')

    const bugs = useBugStore.getState().bugs
    expect(bugs).toHaveLength(1)
    expect(bugs[0].bug_id).toBe('bug-2')
  })

  it('removeBug clears currentBug if it matches', () => {
    useBugStore.getState().setBugs([mockBug, mockBug2])
    useBugStore.getState().setCurrentBug(mockBug)
    useBugStore.getState().removeBug('bug-1')

    expect(useBugStore.getState().currentBug).toBeNull()
  })

  it('removeBug does not affect currentBug if it does not match', () => {
    useBugStore.getState().setBugs([mockBug, mockBug2])
    useBugStore.getState().setCurrentBug(mockBug)
    useBugStore.getState().removeBug('bug-2')

    expect(useBugStore.getState().currentBug).toEqual(mockBug)
  })

  it('setLoading updates loading', () => {
    useBugStore.getState().setLoading(true)
    expect(useBugStore.getState().loading).toBe(true)
  })

  it('setFilters updates filters', () => {
    const filters = { status: ['New'], severity: ['High'] }
    useBugStore.getState().setFilters(filters)
    expect(useBugStore.getState().filters).toEqual(filters)
  })

  it('setSorting updates sortField and sortOrder', () => {
    useBugStore.getState().setSorting('severity', 'desc')
    expect(useBugStore.getState().sortField).toBe('severity')
    expect(useBugStore.getState().sortOrder).toBe('desc')
  })

  it('clear resets all state', () => {
    useBugStore.getState().setBugs([mockBug])
    useBugStore.getState().setCurrentBug(mockBug)
    useBugStore.getState().setLoading(true)
    useBugStore.getState().setFilters({ status: ['New'] })
    useBugStore.getState().setSorting('severity', 'desc')

    useBugStore.getState().clear()

    const state = useBugStore.getState()
    expect(state.bugs).toEqual([])
    expect(state.currentBug).toBeNull()
    expect(state.loading).toBe(false)
    expect(state.filters).toEqual({})
    expect(state.sortField).toBe('created_at')
    expect(state.sortOrder).toBe('asc')
  })
})
