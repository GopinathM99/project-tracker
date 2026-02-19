import { describe, it, expect, vi } from 'vitest'
import type { DependencyLink, Task } from '@shared/schemas'

vi.mock('@/lib/firebase', () => ({ app: {} }))
vi.mock('@/lib/firestore', () => ({ db: {} }))
vi.mock('@/lib/auth', () => ({ auth: {} }))

import { checkCircularDependency, getBlockedStatus } from '@/services/dependency-service'

const makeDep = (
  id: string,
  fromTaskId: string,
  toTaskId: string,
): DependencyLink => ({
  dependency_id: id,
  workspace_id: 'ws-1',
  from_task_id: fromTaskId,
  to_task_id: toTaskId,
  relation_type: 'Finish-to-Start',
  is_cross_project: false,
  created_by: 'user-1',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
})

const makeTask = (id: string, status: Task['status'] = 'Not Started'): Task => ({
  task_id: id,
  workspace_id: 'ws-1',
  project_id: 'proj-1',
  parent_task_id: null,
  title: `Task ${id}`,
  description: '',
  status,
  start_date: '2026-01-01T00:00:00.000Z',
  expected_completion_date: '2026-02-01T00:00:00.000Z',
  due_date: null,
  priority: 'Medium',
  owner: null,
  recurrence_id: null,
  kanban_sort_order: null,
  tag_ids: [],
  deleted_at: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
})

describe('checkCircularDependency', () => {
  it('returns false when there are no existing dependencies', () => {
    const result = checkCircularDependency([], 'A', 'B')
    expect(result).toBe(false)
  })

  it('detects a direct cycle (A->B then B->A)', () => {
    // Existing: A -> B (B depends on A)
    const deps = [makeDep('dep-1', 'A', 'B')]
    // Trying to add: B -> A (A depends on B) -- this creates a cycle
    const result = checkCircularDependency(deps, 'B', 'A')
    expect(result).toBe(true)
  })

  it('detects an indirect cycle (A->B->C then C->A)', () => {
    // Existing: A -> B, B -> C
    const deps = [
      makeDep('dep-1', 'A', 'B'),
      makeDep('dep-2', 'B', 'C'),
    ]
    // Trying to add: C -> A -- this creates a cycle (A->B->C->A)
    const result = checkCircularDependency(deps, 'C', 'A')
    expect(result).toBe(true)
  })

  it('does not give a false positive for valid dependency', () => {
    // Existing: A -> B, B -> C
    const deps = [
      makeDep('dep-1', 'A', 'B'),
      makeDep('dep-2', 'B', 'C'),
    ]
    // Trying to add: A -> C -- this is fine (C already depends on A indirectly)
    const result = checkCircularDependency(deps, 'A', 'C')
    expect(result).toBe(false)
  })

  it('does not give a false positive for unrelated dependency', () => {
    // Existing: A -> B
    const deps = [makeDep('dep-1', 'A', 'B')]
    // Trying to add: C -> D -- completely unrelated
    const result = checkCircularDependency(deps, 'C', 'D')
    expect(result).toBe(false)
  })
})

describe('getBlockedStatus', () => {
  it('returns not blocked when there are no dependencies', () => {
    const task = makeTask('task-1')
    const result = getBlockedStatus(task, [], [])
    expect(result).toEqual({ isBlocked: false, blockedBy: [] })
  })

  it('returns not blocked when all dependencies are done', () => {
    const task = makeTask('task-2')
    const deps = [makeDep('dep-1', 'task-1', 'task-2')]
    const allTasks = [makeTask('task-1', 'Done'), task]
    const result = getBlockedStatus(task, deps, allTasks)
    expect(result).toEqual({ isBlocked: false, blockedBy: [] })
  })

  it('returns blocked when some dependencies are not done', () => {
    const task = makeTask('task-3')
    const deps = [
      makeDep('dep-1', 'task-1', 'task-3'),
      makeDep('dep-2', 'task-2', 'task-3'),
    ]
    const allTasks = [
      makeTask('task-1', 'Done'),
      makeTask('task-2', 'In Progress'),
      task,
    ]
    const result = getBlockedStatus(task, deps, allTasks)
    expect(result.isBlocked).toBe(true)
    expect(result.blockedBy).toEqual(['task-2'])
  })

  it('returns blocked with all undone prerequisites', () => {
    const task = makeTask('task-3')
    const deps = [
      makeDep('dep-1', 'task-1', 'task-3'),
      makeDep('dep-2', 'task-2', 'task-3'),
    ]
    const allTasks = [
      makeTask('task-1', 'In Progress'),
      makeTask('task-2', 'Not Started'),
      task,
    ]
    const result = getBlockedStatus(task, deps, allTasks)
    expect(result.isBlocked).toBe(true)
    expect(result.blockedBy).toEqual(['task-1', 'task-2'])
  })

  it('ignores dependencies for other tasks', () => {
    const task = makeTask('task-1')
    // This dependency is for task-3, not task-1
    const deps = [makeDep('dep-1', 'task-2', 'task-3')]
    const allTasks = [task, makeTask('task-2'), makeTask('task-3')]
    const result = getBlockedStatus(task, deps, allTasks)
    expect(result).toEqual({ isBlocked: false, blockedBy: [] })
  })
})
