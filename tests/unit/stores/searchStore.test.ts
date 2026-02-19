import { describe, it, expect, beforeEach } from 'vitest'
import { useSearchStore } from '@/stores/searchStore'

describe('searchStore', () => {
  beforeEach(() => {
    useSearchStore.getState().clear()
  })

  it('has correct initial state', () => {
    const state = useSearchStore.getState()
    expect(state.query).toBe('')
    expect(state.entityFilter).toBe('all')
    expect(state.statusFilter).toBeNull()
  })

  it('setQuery updates the query', () => {
    useSearchStore.getState().setQuery('hello')
    expect(useSearchStore.getState().query).toBe('hello')
  })

  it('setQuery can set to empty string', () => {
    useSearchStore.getState().setQuery('something')
    useSearchStore.getState().setQuery('')
    expect(useSearchStore.getState().query).toBe('')
  })

  it('setEntityFilter updates the entity filter', () => {
    useSearchStore.getState().setEntityFilter('project')
    expect(useSearchStore.getState().entityFilter).toBe('project')
  })

  it('setEntityFilter can switch between all types', () => {
    const filters = ['all', 'project', 'task', 'bug'] as const
    for (const f of filters) {
      useSearchStore.getState().setEntityFilter(f)
      expect(useSearchStore.getState().entityFilter).toBe(f)
    }
  })

  it('setStatusFilter updates the status filter', () => {
    useSearchStore.getState().setStatusFilter('Active')
    expect(useSearchStore.getState().statusFilter).toBe('Active')
  })

  it('setStatusFilter can set to null', () => {
    useSearchStore.getState().setStatusFilter('Active')
    useSearchStore.getState().setStatusFilter(null)
    expect(useSearchStore.getState().statusFilter).toBeNull()
  })

  it('clear() resets all fields to initial state', () => {
    useSearchStore.getState().setQuery('search term')
    useSearchStore.getState().setEntityFilter('bug')
    useSearchStore.getState().setStatusFilter('In Progress')

    useSearchStore.getState().clear()

    const state = useSearchStore.getState()
    expect(state.query).toBe('')
    expect(state.entityFilter).toBe('all')
    expect(state.statusFilter).toBeNull()
  })

  it('setters do not affect unrelated state', () => {
    useSearchStore.getState().setQuery('test')
    useSearchStore.getState().setEntityFilter('task')

    // Changing status should not affect query or entity filter
    useSearchStore.getState().setStatusFilter('Done')

    const state = useSearchStore.getState()
    expect(state.query).toBe('test')
    expect(state.entityFilter).toBe('task')
    expect(state.statusFilter).toBe('Done')
  })
})
