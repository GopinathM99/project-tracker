import { describe, it, expect, beforeEach } from 'vitest'
import { useKanbanStore } from '@/stores/kanbanStore'

describe('kanbanStore', () => {
  beforeEach(() => {
    useKanbanStore.getState().clearFilters()
  })

  it('has correct initial/default filter state', () => {
    const state = useKanbanStore.getState()
    expect(state.filters).toEqual({
      priority: [],
      dueDateWindow: 'all',
    })
  })

  it('setFilters merges partial filter updates (owner)', () => {
    useKanbanStore.getState().setFilters({ owner: 'alice' })

    const state = useKanbanStore.getState()
    expect(state.filters.owner).toBe('alice')
    // Existing defaults should still be present
    expect(state.filters.priority).toEqual([])
    expect(state.filters.dueDateWindow).toBe('all')
  })

  it('setFilters merges partial filter updates (priority)', () => {
    useKanbanStore.getState().setFilters({ priority: ['High', 'Critical'] })

    const state = useKanbanStore.getState()
    expect(state.filters.priority).toEqual(['High', 'Critical'])
    expect(state.filters.dueDateWindow).toBe('all')
  })

  it('setFilters merges partial filter updates (projectId)', () => {
    useKanbanStore.getState().setFilters({ projectId: 'proj-42' })

    const state = useKanbanStore.getState()
    expect(state.filters.projectId).toBe('proj-42')
    expect(state.filters.priority).toEqual([])
    expect(state.filters.dueDateWindow).toBe('all')
  })

  it('setFilters merges partial filter updates (dueDateWindow)', () => {
    useKanbanStore.getState().setFilters({ dueDateWindow: 'this_week' })

    const state = useKanbanStore.getState()
    expect(state.filters.dueDateWindow).toBe('this_week')
    expect(state.filters.priority).toEqual([])
  })

  it('setFilters can set dueDateWindow to this_month', () => {
    useKanbanStore.getState().setFilters({ dueDateWindow: 'this_month' })

    expect(useKanbanStore.getState().filters.dueDateWindow).toBe('this_month')
  })

  it('setFilters merges multiple properties at once', () => {
    useKanbanStore.getState().setFilters({
      owner: 'bob',
      priority: ['Medium'],
      dueDateWindow: 'this_month',
    })

    const state = useKanbanStore.getState()
    expect(state.filters.owner).toBe('bob')
    expect(state.filters.priority).toEqual(['Medium'])
    expect(state.filters.dueDateWindow).toBe('this_month')
  })

  it('setFilters preserves previously set filters when setting new ones', () => {
    useKanbanStore.getState().setFilters({ owner: 'alice' })
    useKanbanStore.getState().setFilters({ priority: ['High'] })

    const state = useKanbanStore.getState()
    expect(state.filters.owner).toBe('alice')
    expect(state.filters.priority).toEqual(['High'])
  })

  it('setFilters overwrites specific keys when called again', () => {
    useKanbanStore.getState().setFilters({ priority: ['High'] })
    useKanbanStore.getState().setFilters({ priority: ['Low', 'Medium'] })

    expect(useKanbanStore.getState().filters.priority).toEqual(['Low', 'Medium'])
  })

  it('setFilters can set owner to null', () => {
    useKanbanStore.getState().setFilters({ owner: 'alice' })
    useKanbanStore.getState().setFilters({ owner: null })

    expect(useKanbanStore.getState().filters.owner).toBeNull()
  })

  it('setFilters can set owner to undefined', () => {
    useKanbanStore.getState().setFilters({ owner: 'alice' })
    useKanbanStore.getState().setFilters({ owner: undefined })

    expect(useKanbanStore.getState().filters.owner).toBeUndefined()
  })

  it('clearFilters resets to defaults', () => {
    useKanbanStore.getState().setFilters({
      owner: 'alice',
      priority: ['High', 'Critical'],
      projectId: 'proj-1',
      dueDateWindow: 'this_week',
    })

    useKanbanStore.getState().clearFilters()

    const state = useKanbanStore.getState()
    expect(state.filters).toEqual({
      priority: [],
      dueDateWindow: 'all',
    })
  })

  it('clearFilters removes owner, projectId, and resets priority and dueDateWindow', () => {
    useKanbanStore.getState().setFilters({
      owner: 'bob',
      projectId: 'proj-99',
    })

    useKanbanStore.getState().clearFilters()

    const state = useKanbanStore.getState()
    expect(state.filters.owner).toBeUndefined()
    expect(state.filters.projectId).toBeUndefined()
    expect(state.filters.priority).toEqual([])
    expect(state.filters.dueDateWindow).toBe('all')
  })

  it('setFilters with empty object does not change current filters', () => {
    useKanbanStore.getState().setFilters({ owner: 'alice', priority: ['High'] })
    useKanbanStore.getState().setFilters({})

    const state = useKanbanStore.getState()
    expect(state.filters.owner).toBe('alice')
    expect(state.filters.priority).toEqual(['High'])
  })

  it('setFilters can set priority to empty array', () => {
    useKanbanStore.getState().setFilters({ priority: ['High', 'Low'] })
    useKanbanStore.getState().setFilters({ priority: [] })

    expect(useKanbanStore.getState().filters.priority).toEqual([])
  })

  it('setFilters can set dueDateWindow back to all', () => {
    useKanbanStore.getState().setFilters({ dueDateWindow: 'this_week' })
    useKanbanStore.getState().setFilters({ dueDateWindow: 'all' })

    expect(useKanbanStore.getState().filters.dueDateWindow).toBe('all')
  })
})
