import { describe, it, expect } from 'vitest'
import { bugSchema } from '@shared/schemas/bug'

describe('bugSchema', () => {
  const validBug = {
    bug_id: 'bug-1',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    title: 'A Bug',
    description: '',
    status: 'New' as const,
    severity: 'Medium' as const,
    priority: 'Medium' as const,
    reporter: 'user-1',
    assignee: null,
    environment: '',
    steps_to_reproduce: '',
    expected_result: '',
    actual_result: '',
    reported_at: '2026-01-15T00:00:00.000Z',
    target_fix_date: null,
    resolved_at: null,
    tag_ids: [],
    deleted_at: null,
    created_at: '2026-01-15T00:00:00.000Z',
    updated_at: '2026-01-15T00:00:00.000Z',
  }

  it('accepts valid bug', () => {
    const result = bugSchema.safeParse(validBug)
    expect(result.success).toBe(true)
  })

  it('rejects target_fix_date < reported_at (FR-087)', () => {
    const result = bugSchema.safeParse({
      ...validBug,
      reported_at: '2026-06-01T00:00:00.000Z',
      target_fix_date: '2026-01-01T00:00:00.000Z',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid bug statuses', () => {
    for (const status of [
      'New',
      'Triaged',
      'In Progress',
      'Fixed',
      'Verified',
      'Closed',
      'Reopened',
    ]) {
      const result = bugSchema.safeParse({ ...validBug, status })
      expect(result.success).toBe(true)
    }
  })
})
