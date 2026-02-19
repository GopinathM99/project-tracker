import { describe, it, expect, vi } from 'vitest'
import type { Task } from '@shared/schemas'

vi.mock('@/lib/firebase', () => ({ app: {} }))
vi.mock('@/lib/firestore', () => ({ db: {} }))
vi.mock('@/lib/auth', () => ({ auth: {} }))

import { filterTasks, sortTasks } from '@/services/task-service'

const baseMockTask: Task = {
  task_id: 'task-1',
  workspace_id: 'ws-1',
  project_id: 'proj-1',
  parent_task_id: null,
  title: 'Alpha Task',
  description: '',
  status: 'Not Started',
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
}

const tasks: Task[] = [
  { ...baseMockTask },
  {
    ...baseMockTask,
    task_id: 'task-2',
    title: 'Beta Task',
    status: 'In Progress',
    priority: 'High',
    owner: 'user-1',
    due_date: '2026-03-01T00:00:00.000Z',
    created_at: '2026-01-02T00:00:00.000Z',
  },
  {
    ...baseMockTask,
    task_id: 'task-3',
    title: 'Gamma Task',
    status: 'Blocked',
    priority: 'Critical',
    owner: 'user-2',
    due_date: '2026-02-15T00:00:00.000Z',
    created_at: '2026-01-03T00:00:00.000Z',
  },
  {
    ...baseMockTask,
    task_id: 'task-4',
    title: 'Delta Task',
    status: 'Done',
    priority: 'Low',
    owner: 'user-1',
    due_date: '2026-04-01T00:00:00.000Z',
    created_at: '2026-01-04T00:00:00.000Z',
  },
]

describe('filterTasks', () => {
  it('returns all tasks when no filters', () => {
    const result = filterTasks(tasks, {})
    expect(result).toHaveLength(4)
  })

  it('filters by status', () => {
    const result = filterTasks(tasks, { status: ['Done'] })
    expect(result).toHaveLength(1)
    expect(result[0].task_id).toBe('task-4')
  })

  it('filters by multiple statuses', () => {
    const result = filterTasks(tasks, { status: ['Not Started', 'In Progress'] })
    expect(result).toHaveLength(2)
    expect(result.map((t) => t.task_id)).toEqual(['task-1', 'task-2'])
  })

  it('filters by priority', () => {
    const result = filterTasks(tasks, { priority: ['Critical'] })
    expect(result).toHaveLength(1)
    expect(result[0].task_id).toBe('task-3')
  })

  it('filters by multiple priorities', () => {
    const result = filterTasks(tasks, { priority: ['High', 'Critical'] })
    expect(result).toHaveLength(2)
    expect(result.map((t) => t.task_id)).toEqual(['task-2', 'task-3'])
  })

  it('filters by owner (string)', () => {
    const result = filterTasks(tasks, { owner: 'user-1' })
    expect(result).toHaveLength(2)
    expect(result.map((t) => t.task_id)).toEqual(['task-2', 'task-4'])
  })

  it('filters by owner null (unassigned)', () => {
    const result = filterTasks(tasks, { owner: null })
    expect(result).toHaveLength(1)
    expect(result[0].task_id).toBe('task-1')
  })

  it('filters by search (case-insensitive title match)', () => {
    const result = filterTasks(tasks, { search: 'gamma' })
    expect(result).toHaveLength(1)
    expect(result[0].task_id).toBe('task-3')
  })

  it('filters by search with mixed case', () => {
    const result = filterTasks(tasks, { search: 'BETA' })
    expect(result).toHaveLength(1)
    expect(result[0].task_id).toBe('task-2')
  })

  it('combines multiple filters', () => {
    const result = filterTasks(tasks, { status: ['In Progress', 'Done'], owner: 'user-1' })
    expect(result).toHaveLength(2)
    expect(result.map((t) => t.task_id)).toEqual(['task-2', 'task-4'])
  })

  it('combines filters resulting in no matches', () => {
    const result = filterTasks(tasks, { status: ['Done'], owner: 'user-2' })
    expect(result).toHaveLength(0)
  })

  it('returns all when filters have empty arrays', () => {
    const result = filterTasks(tasks, { status: [], priority: [] })
    expect(result).toHaveLength(4)
  })
})

describe('sortTasks', () => {
  it('sorts by title asc', () => {
    const result = sortTasks(tasks, 'title', 'asc')
    expect(result.map((t) => t.title)).toEqual([
      'Alpha Task',
      'Beta Task',
      'Delta Task',
      'Gamma Task',
    ])
  })

  it('sorts by title desc', () => {
    const result = sortTasks(tasks, 'title', 'desc')
    expect(result.map((t) => t.title)).toEqual([
      'Gamma Task',
      'Delta Task',
      'Beta Task',
      'Alpha Task',
    ])
  })

  it('sorts by priority asc (Low < Medium < High < Critical)', () => {
    const result = sortTasks(tasks, 'priority', 'asc')
    expect(result.map((t) => t.priority)).toEqual(['Low', 'Medium', 'High', 'Critical'])
  })

  it('sorts by priority desc (Critical > High > Medium > Low)', () => {
    const result = sortTasks(tasks, 'priority', 'desc')
    expect(result.map((t) => t.priority)).toEqual(['Critical', 'High', 'Medium', 'Low'])
  })

  it('sorts by status order (Not Started, In Progress, Blocked, Done)', () => {
    const result = sortTasks(tasks, 'status', 'asc')
    expect(result.map((t) => t.status)).toEqual([
      'Not Started',
      'In Progress',
      'Blocked',
      'Done',
    ])
  })

  it('sorts by status desc', () => {
    const result = sortTasks(tasks, 'status', 'desc')
    expect(result.map((t) => t.status)).toEqual([
      'Done',
      'Blocked',
      'In Progress',
      'Not Started',
    ])
  })

  it('sorts by due_date asc with nulls last', () => {
    const result = sortTasks(tasks, 'due_date', 'asc')
    expect(result.map((t) => t.task_id)).toEqual(['task-3', 'task-2', 'task-4', 'task-1'])
  })

  it('sorts by due_date desc with nulls first (null comparison is inverted)', () => {
    const result = sortTasks(tasks, 'due_date', 'desc')
    // Nulls sort to position 1 in asc (last), but inversion puts them first in desc
    expect(result.map((t) => t.task_id)).toEqual(['task-1', 'task-4', 'task-2', 'task-3'])
  })

  it('sorts by created_at asc', () => {
    const result = sortTasks(tasks, 'created_at', 'asc')
    expect(result.map((t) => t.task_id)).toEqual(['task-1', 'task-2', 'task-3', 'task-4'])
  })

  it('sorts by created_at desc', () => {
    const result = sortTasks(tasks, 'created_at', 'desc')
    expect(result.map((t) => t.task_id)).toEqual(['task-4', 'task-3', 'task-2', 'task-1'])
  })

  it('does not mutate the original array', () => {
    const original = [...tasks]
    sortTasks(tasks, 'title', 'desc')
    expect(tasks.map((t) => t.task_id)).toEqual(original.map((t) => t.task_id))
  })
})
