import { describe, it, expect } from 'vitest'
import {
  validateProjectDates,
  validateTaskDatesInProject,
  validateBugDatesInProject,
  validateFieldLength,
  validateSubtaskDepth,
  detectDependencyCycle,
  validateEntityLinkCount,
} from '@shared/utils/validation-helpers'

// ----------------------------------------------------------------
// validateProjectDates
// ----------------------------------------------------------------

describe('validateProjectDates', () => {
  it('returns null when target end date is after start date', () => {
    expect(validateProjectDates('2025-01-01T00:00:00.000Z', '2025-12-31T00:00:00.000Z')).toBeNull()
  })

  it('returns null when both dates are the same', () => {
    expect(validateProjectDates('2025-06-15T00:00:00.000Z', '2025-06-15T00:00:00.000Z')).toBeNull()
  })

  it('returns error when target end date is before start date', () => {
    const result = validateProjectDates('2025-06-15T00:00:00.000Z', '2025-01-01T00:00:00.000Z')
    expect(result).toBeTypeOf('string')
    expect(result).toContain('Target end date')
  })

  it('returns null when start date is empty string', () => {
    expect(validateProjectDates('', '2025-12-31T00:00:00.000Z')).toBeNull()
  })

  it('returns null when target end date is empty string', () => {
    expect(validateProjectDates('2025-01-01T00:00:00.000Z', '')).toBeNull()
  })

  it('returns null when both dates are empty', () => {
    expect(validateProjectDates('', '')).toBeNull()
  })

  it('compares only date portion ignoring time', () => {
    // Same date, different times — should be valid
    expect(
      validateProjectDates('2025-06-15T23:59:59.000Z', '2025-06-15T00:00:00.000Z'),
    ).toBeNull()
  })
})

// ----------------------------------------------------------------
// validateTaskDatesInProject
// ----------------------------------------------------------------

describe('validateTaskDatesInProject', () => {
  const project = {
    start_date: '2025-01-01T00:00:00.000Z',
    target_end_date: '2025-12-31T00:00:00.000Z',
  }

  it('returns null when task dates are within project range', () => {
    const task = {
      start_date: '2025-02-01T00:00:00.000Z',
      expected_completion_date: '2025-06-01T00:00:00.000Z',
      due_date: null,
    }
    expect(validateTaskDatesInProject(task, project)).toBeNull()
  })

  it('returns error when task start date is before project start', () => {
    const task = {
      start_date: '2024-12-01T00:00:00.000Z',
      expected_completion_date: '2025-06-01T00:00:00.000Z',
      due_date: null,
    }
    const result = validateTaskDatesInProject(task, project)
    expect(result).toBeTypeOf('string')
    expect(result).toContain('start date')
    expect(result).toContain('before')
  })

  it('returns error when expected completion date is after project end', () => {
    const task = {
      start_date: '2025-02-01T00:00:00.000Z',
      expected_completion_date: '2026-03-01T00:00:00.000Z',
      due_date: null,
    }
    const result = validateTaskDatesInProject(task, project)
    expect(result).toBeTypeOf('string')
    expect(result).toContain('expected completion date')
    expect(result).toContain('after')
  })

  it('returns error when due_date is after project end', () => {
    const task = {
      start_date: '2025-02-01T00:00:00.000Z',
      expected_completion_date: '2025-06-01T00:00:00.000Z',
      due_date: '2026-02-01T00:00:00.000Z',
    }
    const result = validateTaskDatesInProject(task, project)
    expect(result).toBeTypeOf('string')
    expect(result).toContain('due date')
    expect(result).toContain('after')
  })

  it('returns null when due_date is null', () => {
    const task = {
      start_date: '2025-02-01T00:00:00.000Z',
      expected_completion_date: '2025-06-01T00:00:00.000Z',
      due_date: null,
    }
    expect(validateTaskDatesInProject(task, project)).toBeNull()
  })

  it('returns null when task dates are exactly on project boundaries', () => {
    const task = {
      start_date: '2025-01-01T00:00:00.000Z',
      expected_completion_date: '2025-12-31T00:00:00.000Z',
      due_date: '2025-12-31T00:00:00.000Z',
    }
    expect(validateTaskDatesInProject(task, project)).toBeNull()
  })
})

// ----------------------------------------------------------------
// validateBugDatesInProject
// ----------------------------------------------------------------

describe('validateBugDatesInProject', () => {
  const project = {
    start_date: '2025-01-01T00:00:00.000Z',
    target_end_date: '2025-12-31T00:00:00.000Z',
  }

  it('returns null when bug dates are within project range', () => {
    const bug = {
      reported_at: '2025-03-01T00:00:00.000Z',
      target_fix_date: '2025-06-01T00:00:00.000Z',
    }
    expect(validateBugDatesInProject(bug, project)).toBeNull()
  })

  it('returns error when bug reported date is before project start', () => {
    const bug = {
      reported_at: '2024-11-01T00:00:00.000Z',
      target_fix_date: null,
    }
    const result = validateBugDatesInProject(bug, project)
    expect(result).toBeTypeOf('string')
    expect(result).toContain('reported date')
    expect(result).toContain('before')
  })

  it('returns error when target fix date is after project end', () => {
    const bug = {
      reported_at: '2025-03-01T00:00:00.000Z',
      target_fix_date: '2026-03-01T00:00:00.000Z',
    }
    const result = validateBugDatesInProject(bug, project)
    expect(result).toBeTypeOf('string')
    expect(result).toContain('target fix date')
    expect(result).toContain('after')
  })

  it('returns null when target_fix_date is null', () => {
    const bug = {
      reported_at: '2025-03-01T00:00:00.000Z',
      target_fix_date: null,
    }
    expect(validateBugDatesInProject(bug, project)).toBeNull()
  })

  it('returns null when dates are exactly on project boundaries', () => {
    const bug = {
      reported_at: '2025-01-01T00:00:00.000Z',
      target_fix_date: '2025-12-31T00:00:00.000Z',
    }
    expect(validateBugDatesInProject(bug, project)).toBeNull()
  })
})

// ----------------------------------------------------------------
// validateFieldLength
// ----------------------------------------------------------------

describe('validateFieldLength', () => {
  it('returns null when value is within limit', () => {
    expect(validateFieldLength('hello', 10, 'Title')).toBeNull()
  })

  it('returns null when value is exactly at limit', () => {
    expect(validateFieldLength('12345', 5, 'Title')).toBeNull()
  })

  it('returns error when value exceeds limit', () => {
    const result = validateFieldLength('123456', 5, 'Title')
    expect(result).toBeTypeOf('string')
    expect(result).toContain('Title')
    expect(result).toContain('5')
  })

  it('returns null for empty string', () => {
    expect(validateFieldLength('', 200, 'Title')).toBeNull()
  })

  it('includes field name in error message', () => {
    const result = validateFieldLength('x'.repeat(201), 200, 'Description')
    expect(result).toContain('Description')
  })
})

// ----------------------------------------------------------------
// validateSubtaskDepth
// ----------------------------------------------------------------

describe('validateSubtaskDepth', () => {
  it('returns null when parentTask is null (top-level task)', () => {
    expect(validateSubtaskDepth(null, [], 5)).toBeNull()
  })

  it('returns null when depth is within limit', () => {
    // depth 1: parentTask has no parent
    const parent = { task_id: 't1', parent_task_id: null }
    expect(validateSubtaskDepth(parent, [parent], 5)).toBeNull()
  })

  it('returns error when depth exceeds maxDepth', () => {
    // Build a chain: t1 -> t2 -> t3 -> t4 -> t5 -> (new child)
    const allTasks = [
      { task_id: 't1', parent_task_id: null },
      { task_id: 't2', parent_task_id: 't1' },
      { task_id: 't3', parent_task_id: 't2' },
      { task_id: 't4', parent_task_id: 't3' },
      { task_id: 't5', parent_task_id: 't4' },
    ]
    const parentTask = allTasks[4] // t5, already at depth 5

    const result = validateSubtaskDepth(parentTask, allTasks, 5)
    expect(result).toBeTypeOf('string')
    expect(result).toContain('depth')
  })

  it('calculates chain depth correctly', () => {
    // Chain of 2: t1 -> t2 -> (new child), maxDepth=3 => valid
    const allTasks = [
      { task_id: 't1', parent_task_id: null },
      { task_id: 't2', parent_task_id: 't1' },
    ]
    const parentTask = allTasks[1] // depth=2
    expect(validateSubtaskDepth(parentTask, allTasks, 3)).toBeNull()
  })

  it('returns error at exactly maxDepth', () => {
    // Chain of 3: t1 -> t2 -> t3 -> (new child), maxDepth=3
    const allTasks = [
      { task_id: 't1', parent_task_id: null },
      { task_id: 't2', parent_task_id: 't1' },
      { task_id: 't3', parent_task_id: 't2' },
    ]
    const parentTask = allTasks[2] // depth=3

    const result = validateSubtaskDepth(parentTask, allTasks, 3)
    expect(result).toBeTypeOf('string')
    expect(result).toContain('depth')
  })

  it('uses default maxDepth from FIELD_LIMITS when not specified', () => {
    // Should use SUBTASK_DEPTH_MAX = 5
    const parent = { task_id: 't1', parent_task_id: null }
    expect(validateSubtaskDepth(parent, [parent])).toBeNull()
  })
})

// ----------------------------------------------------------------
// detectDependencyCycle
// ----------------------------------------------------------------

describe('detectDependencyCycle', () => {
  it('returns false when no existing dependencies', () => {
    expect(detectDependencyCycle('A', 'B', [])).toBe(false)
  })

  it('returns false when adding a dependency does not create a cycle', () => {
    const deps = [{ from_task_id: 'A', to_task_id: 'B' }]
    // Adding C -> D, no cycle
    expect(detectDependencyCycle('C', 'D', deps)).toBe(false)
  })

  it('returns true when adding a direct reverse dependency', () => {
    // Existing: A -> B. Adding B -> A would create a cycle.
    const deps = [{ from_task_id: 'A', to_task_id: 'B' }]
    expect(detectDependencyCycle('B', 'A', deps)).toBe(true)
  })

  it('returns true for indirect cycle', () => {
    // Existing: A -> B -> C. Adding C -> A would create a cycle.
    const deps = [
      { from_task_id: 'A', to_task_id: 'B' },
      { from_task_id: 'B', to_task_id: 'C' },
    ]
    expect(detectDependencyCycle('C', 'A', deps)).toBe(true)
  })

  it('returns false for non-cyclical complex graph', () => {
    // A -> B, A -> C, B -> D, C -> D. Adding E -> D — no cycle.
    const deps = [
      { from_task_id: 'A', to_task_id: 'B' },
      { from_task_id: 'A', to_task_id: 'C' },
      { from_task_id: 'B', to_task_id: 'D' },
      { from_task_id: 'C', to_task_id: 'D' },
    ]
    expect(detectDependencyCycle('E', 'D', deps)).toBe(false)
  })

  it('returns true for complex graph with cycle', () => {
    // A -> B -> C -> D. Adding D -> A creates a cycle.
    const deps = [
      { from_task_id: 'A', to_task_id: 'B' },
      { from_task_id: 'B', to_task_id: 'C' },
      { from_task_id: 'C', to_task_id: 'D' },
    ]
    expect(detectDependencyCycle('D', 'A', deps)).toBe(true)
  })

  it('handles self-referencing dependency (from == to in existing)', () => {
    // Adding A -> A is implicitly a cycle but the function checks
    // existing deps — the BFS from toTaskId would find fromTaskId immediately
    // if they are the same since toTaskId == fromTaskId
    expect(detectDependencyCycle('A', 'A', [])).toBe(true)
  })

  it('returns false when toTaskId has no outgoing edges', () => {
    const deps = [
      { from_task_id: 'A', to_task_id: 'B' },
      { from_task_id: 'A', to_task_id: 'C' },
    ]
    // Adding X -> B: BFS from B, B has no outgoing edges, can never reach X
    expect(detectDependencyCycle('X', 'B', deps)).toBe(false)
  })
})

// ----------------------------------------------------------------
// validateEntityLinkCount
// ----------------------------------------------------------------

describe('validateEntityLinkCount', () => {
  it('returns null when count is below limit', () => {
    expect(validateEntityLinkCount(5, 20)).toBeNull()
  })

  it('returns null when count is zero', () => {
    expect(validateEntityLinkCount(0, 20)).toBeNull()
  })

  it('returns error when count is at the limit', () => {
    const result = validateEntityLinkCount(20, 20)
    expect(result).toBeTypeOf('string')
    expect(result).toContain('20')
  })

  it('returns error when count exceeds the limit', () => {
    const result = validateEntityLinkCount(25, 20)
    expect(result).toBeTypeOf('string')
    expect(result).toContain('20')
  })

  it('uses default maxLinks from FIELD_LIMITS when not specified', () => {
    // ENTITY_LINKS_MAX = 20
    expect(validateEntityLinkCount(0)).toBeNull()
    expect(validateEntityLinkCount(19)).toBeNull()
    const result = validateEntityLinkCount(20)
    expect(result).toBeTypeOf('string')
  })
})
