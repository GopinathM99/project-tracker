import { describe, it, expect, beforeEach } from 'vitest'
import { useDependencyStore } from '@/stores/dependencyStore'
import type { DependencyLink } from '@shared/schemas'

const mockDep: DependencyLink = {
  dependency_id: 'dep-1',
  workspace_id: 'ws-1',
  from_task_id: 'task-1',
  to_task_id: 'task-2',
  relation_type: 'Finish-to-Start',
  is_cross_project: false,
  created_by: 'user-1',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

const mockDep2: DependencyLink = {
  ...mockDep,
  dependency_id: 'dep-2',
  from_task_id: 'task-2',
  to_task_id: 'task-3',
}

describe('dependencyStore', () => {
  beforeEach(() => {
    useDependencyStore.getState().clear()
  })

  it('has correct initial state', () => {
    const state = useDependencyStore.getState()
    expect(state.dependencies).toEqual([])
  })

  it('setDependencies updates the dependencies array', () => {
    useDependencyStore.getState().setDependencies([mockDep, mockDep2])
    expect(useDependencyStore.getState().dependencies).toEqual([mockDep, mockDep2])
  })

  it('addDependency appends a dependency to the array', () => {
    useDependencyStore.getState().setDependencies([mockDep])
    useDependencyStore.getState().addDependency(mockDep2)

    const deps = useDependencyStore.getState().dependencies
    expect(deps).toHaveLength(2)
    expect(deps[0].dependency_id).toBe('dep-1')
    expect(deps[1].dependency_id).toBe('dep-2')
  })

  it('addDependency to empty array', () => {
    useDependencyStore.getState().addDependency(mockDep)

    const deps = useDependencyStore.getState().dependencies
    expect(deps).toHaveLength(1)
    expect(deps[0]).toEqual(mockDep)
  })

  it('removeDependency removes from the array', () => {
    useDependencyStore.getState().setDependencies([mockDep, mockDep2])
    useDependencyStore.getState().removeDependency('dep-1')

    const deps = useDependencyStore.getState().dependencies
    expect(deps).toHaveLength(1)
    expect(deps[0].dependency_id).toBe('dep-2')
  })

  it('removeDependency with non-existent id does not change array', () => {
    useDependencyStore.getState().setDependencies([mockDep])
    useDependencyStore.getState().removeDependency('dep-999')

    expect(useDependencyStore.getState().dependencies).toHaveLength(1)
  })

  it('clear resets all state', () => {
    useDependencyStore.getState().setDependencies([mockDep, mockDep2])

    useDependencyStore.getState().clear()

    const state = useDependencyStore.getState()
    expect(state.dependencies).toEqual([])
  })
})
