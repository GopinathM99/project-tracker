import { describe, it, expect } from 'vitest'
import { projectSchema } from '@shared/schemas/project'

describe('projectSchema', () => {
  const validProject = {
    project_id: 'proj-1',
    workspace_id: 'ws-1',
    folder_id: null,
    name: 'My Project',
    description: 'A project',
    status: 'Active' as const,
    owner: 'user-1',
    start_date: '2026-01-01T00:00:00.000Z',
    target_end_date: '2026-06-01T00:00:00.000Z',
    tag_ids: [],
    deleted_at: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  }

  it('accepts valid project', () => {
    const result = projectSchema.safeParse(validProject)
    expect(result.success).toBe(true)
  })

  it('rejects project where target_end_date < start_date (FR-106)', () => {
    const result = projectSchema.safeParse({
      ...validProject,
      start_date: '2026-06-01T00:00:00.000Z',
      target_end_date: '2026-01-01T00:00:00.000Z',
    })
    expect(result.success).toBe(false)
  })

  it('accepts project where target_end_date == start_date', () => {
    const result = projectSchema.safeParse({
      ...validProject,
      start_date: '2026-03-01T00:00:00.000Z',
      target_end_date: '2026-03-01T00:00:00.000Z',
    })
    expect(result.success).toBe(true)
  })

  it('rejects title exceeding 200 chars', () => {
    const result = projectSchema.safeParse({
      ...validProject,
      name: 'a'.repeat(201),
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid status', () => {
    const result = projectSchema.safeParse({
      ...validProject,
      status: 'Invalid',
    })
    expect(result.success).toBe(false)
  })
})
