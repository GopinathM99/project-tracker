import { describe, it, expect } from 'vitest'
import { taskSchema } from '@shared/schemas/task'

describe('taskSchema', () => {
  const validTask = {
    task_id: 'task-1',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    parent_task_id: null,
    title: 'My Task',
    description: '',
    status: 'Not Started' as const,
    start_date: '2026-01-01T00:00:00.000Z',
    expected_completion_date: '2026-02-01T00:00:00.000Z',
    due_date: null,
    priority: 'Medium' as const,
    owner: null,
    recurrence_id: null,
    kanban_sort_order: null,
    tag_ids: [],
    deleted_at: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  }

  it('accepts valid task', () => {
    const result = taskSchema.safeParse(validTask)
    expect(result.success).toBe(true)
  })

  it('rejects expected_completion_date < start_date (FR-074)', () => {
    const result = taskSchema.safeParse({
      ...validTask,
      start_date: '2026-06-01T00:00:00.000Z',
      expected_completion_date: '2026-01-01T00:00:00.000Z',
    })
    expect(result.success).toBe(false)
  })

  it('rejects due_date < start_date (FR-074)', () => {
    const result = taskSchema.safeParse({
      ...validTask,
      start_date: '2026-03-01T00:00:00.000Z',
      due_date: '2026-01-01T00:00:00.000Z',
    })
    expect(result.success).toBe(false)
  })

  it('accepts due_date == null', () => {
    const result = taskSchema.safeParse({ ...validTask, due_date: null })
    expect(result.success).toBe(true)
  })

  it('accepts all valid statuses', () => {
    for (const status of ['Not Started', 'In Progress', 'Blocked', 'Done']) {
      const result = taskSchema.safeParse({ ...validTask, status })
      expect(result.success).toBe(true)
    }
  })

  it('accepts all valid priorities', () => {
    for (const priority of ['Low', 'Medium', 'High', 'Critical']) {
      const result = taskSchema.safeParse({ ...validTask, priority })
      expect(result.success).toBe(true)
    }
  })

  it('rejects title exceeding 200 chars', () => {
    const result = taskSchema.safeParse({ ...validTask, title: 'a'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('rejects empty project_id (FR-073)', () => {
    const result = taskSchema.safeParse({ ...validTask, project_id: '' })
    expect(result.success).toBe(false)
  })
})
