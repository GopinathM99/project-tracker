import { describe, it, expect, vi } from 'vitest'
import type { Bug } from '@shared/schemas'

vi.mock('@/lib/firebase', () => ({ app: {} }))
vi.mock('@/lib/firestore', () => ({ db: {} }))
vi.mock('@/lib/auth', () => ({ auth: {} }))

import { filterBugs, sortBugs } from '@/services/bug-service'

const baseMockBug: Bug = {
  bug_id: 'bug-1',
  workspace_id: 'ws-1',
  project_id: 'proj-1',
  title: 'Alpha Bug',
  description: '',
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

const bugs: Bug[] = [
  { ...baseMockBug },
  {
    ...baseMockBug,
    bug_id: 'bug-2',
    title: 'Beta Bug',
    status: 'In Progress',
    severity: 'High',
    priority: 'High',
    assignee: 'user-1',
    reported_at: '2026-01-02T00:00:00.000Z',
    target_fix_date: '2026-03-01T00:00:00.000Z',
    created_at: '2026-01-02T00:00:00.000Z',
  },
  {
    ...baseMockBug,
    bug_id: 'bug-3',
    title: 'Gamma Bug',
    status: 'Fixed',
    severity: 'Critical',
    priority: 'Critical',
    assignee: 'user-2',
    reported_at: '2026-01-03T00:00:00.000Z',
    target_fix_date: '2026-02-15T00:00:00.000Z',
    created_at: '2026-01-03T00:00:00.000Z',
  },
  {
    ...baseMockBug,
    bug_id: 'bug-4',
    title: 'Delta Bug',
    status: 'Closed',
    severity: 'Low',
    priority: 'Low',
    assignee: 'user-1',
    reported_at: '2026-01-04T00:00:00.000Z',
    target_fix_date: '2026-04-01T00:00:00.000Z',
    created_at: '2026-01-04T00:00:00.000Z',
  },
]

describe('filterBugs', () => {
  it('returns all bugs when no filters', () => {
    const result = filterBugs(bugs, {})
    expect(result).toHaveLength(4)
  })

  it('filters by status', () => {
    const result = filterBugs(bugs, { status: ['Closed'] })
    expect(result).toHaveLength(1)
    expect(result[0].bug_id).toBe('bug-4')
  })

  it('filters by multiple statuses', () => {
    const result = filterBugs(bugs, { status: ['New', 'In Progress'] })
    expect(result).toHaveLength(2)
    expect(result.map((b) => b.bug_id)).toEqual(['bug-1', 'bug-2'])
  })

  it('filters by severity', () => {
    const result = filterBugs(bugs, { severity: ['Critical'] })
    expect(result).toHaveLength(1)
    expect(result[0].bug_id).toBe('bug-3')
  })

  it('filters by priority', () => {
    const result = filterBugs(bugs, { priority: ['High'] })
    expect(result).toHaveLength(1)
    expect(result[0].bug_id).toBe('bug-2')
  })

  it('filters by assignee (string)', () => {
    const result = filterBugs(bugs, { assignee: 'user-1' })
    expect(result).toHaveLength(2)
    expect(result.map((b) => b.bug_id)).toEqual(['bug-2', 'bug-4'])
  })

  it('filters by assignee null (unassigned)', () => {
    const result = filterBugs(bugs, { assignee: null })
    expect(result).toHaveLength(1)
    expect(result[0].bug_id).toBe('bug-1')
  })

  it('filters by search (case-insensitive title match)', () => {
    const result = filterBugs(bugs, { search: 'gamma' })
    expect(result).toHaveLength(1)
    expect(result[0].bug_id).toBe('bug-3')
  })

  it('filters by search with mixed case', () => {
    const result = filterBugs(bugs, { search: 'BETA' })
    expect(result).toHaveLength(1)
    expect(result[0].bug_id).toBe('bug-2')
  })

  it('combines multiple filters', () => {
    const result = filterBugs(bugs, { status: ['In Progress', 'Closed'], assignee: 'user-1' })
    expect(result).toHaveLength(2)
    expect(result.map((b) => b.bug_id)).toEqual(['bug-2', 'bug-4'])
  })

  it('combines filters resulting in no matches', () => {
    const result = filterBugs(bugs, { status: ['Closed'], assignee: 'user-2' })
    expect(result).toHaveLength(0)
  })

  it('returns all when filters have empty arrays', () => {
    const result = filterBugs(bugs, { status: [], severity: [], priority: [] })
    expect(result).toHaveLength(4)
  })
})

describe('sortBugs', () => {
  it('sorts by title asc', () => {
    const result = sortBugs(bugs, 'title', 'asc')
    expect(result.map((b) => b.title)).toEqual([
      'Alpha Bug',
      'Beta Bug',
      'Delta Bug',
      'Gamma Bug',
    ])
  })

  it('sorts by title desc', () => {
    const result = sortBugs(bugs, 'title', 'desc')
    expect(result.map((b) => b.title)).toEqual([
      'Gamma Bug',
      'Delta Bug',
      'Beta Bug',
      'Alpha Bug',
    ])
  })

  it('sorts by severity asc (Low < Medium < High < Critical)', () => {
    const result = sortBugs(bugs, 'severity', 'asc')
    expect(result.map((b) => b.severity)).toEqual(['Low', 'Medium', 'High', 'Critical'])
  })

  it('sorts by severity desc (Critical > High > Medium > Low)', () => {
    const result = sortBugs(bugs, 'severity', 'desc')
    expect(result.map((b) => b.severity)).toEqual(['Critical', 'High', 'Medium', 'Low'])
  })

  it('sorts by priority asc (Low < Medium < High < Critical)', () => {
    const result = sortBugs(bugs, 'priority', 'asc')
    expect(result.map((b) => b.priority)).toEqual(['Low', 'Medium', 'High', 'Critical'])
  })

  it('sorts by priority desc (Critical > High > Medium > Low)', () => {
    const result = sortBugs(bugs, 'priority', 'desc')
    expect(result.map((b) => b.priority)).toEqual(['Critical', 'High', 'Medium', 'Low'])
  })

  it('sorts by status asc (New, In Progress, Fixed, Closed)', () => {
    const result = sortBugs(bugs, 'status', 'asc')
    expect(result.map((b) => b.status)).toEqual([
      'New',
      'In Progress',
      'Fixed',
      'Closed',
    ])
  })

  it('sorts by status desc', () => {
    const result = sortBugs(bugs, 'status', 'desc')
    expect(result.map((b) => b.status)).toEqual([
      'Closed',
      'Fixed',
      'In Progress',
      'New',
    ])
  })

  it('sorts by reported_at asc', () => {
    const result = sortBugs(bugs, 'reported_at', 'asc')
    expect(result.map((b) => b.bug_id)).toEqual(['bug-1', 'bug-2', 'bug-3', 'bug-4'])
  })

  it('sorts by reported_at desc', () => {
    const result = sortBugs(bugs, 'reported_at', 'desc')
    expect(result.map((b) => b.bug_id)).toEqual(['bug-4', 'bug-3', 'bug-2', 'bug-1'])
  })

  it('sorts by created_at asc', () => {
    const result = sortBugs(bugs, 'created_at', 'asc')
    expect(result.map((b) => b.bug_id)).toEqual(['bug-1', 'bug-2', 'bug-3', 'bug-4'])
  })

  it('sorts by created_at desc', () => {
    const result = sortBugs(bugs, 'created_at', 'desc')
    expect(result.map((b) => b.bug_id)).toEqual(['bug-4', 'bug-3', 'bug-2', 'bug-1'])
  })

  it('sorts by target_fix_date asc with nulls last', () => {
    const result = sortBugs(bugs, 'target_fix_date', 'asc')
    expect(result.map((b) => b.bug_id)).toEqual(['bug-3', 'bug-2', 'bug-4', 'bug-1'])
  })

  it('sorts by target_fix_date desc with nulls first', () => {
    const result = sortBugs(bugs, 'target_fix_date', 'desc')
    expect(result.map((b) => b.bug_id)).toEqual(['bug-1', 'bug-4', 'bug-2', 'bug-3'])
  })

  it('does not mutate the original array', () => {
    const original = [...bugs]
    sortBugs(bugs, 'title', 'desc')
    expect(bugs.map((b) => b.bug_id)).toEqual(original.map((b) => b.bug_id))
  })
})
