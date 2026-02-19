import { describe, it, expect } from 'vitest'
import { searchEntities } from '@/services/search-service'
import type { Project, Task, Bug } from '@shared/schemas'

// --- Minimal mock data factories ---

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    project_id: 'proj-1',
    workspace_id: 'ws-1',
    folder_id: null,
    name: 'Default Project',
    description: 'A default project description',
    status: 'Active',
    owner: 'user-1',
    start_date: '2025-01-01T00:00:00.000Z',
    target_end_date: '2025-12-31T00:00:00.000Z',
    tag_ids: [],
    deleted_at: null,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    task_id: 'task-1',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    parent_task_id: null,
    title: 'Default Task',
    description: 'A default task description',
    status: 'Not Started',
    start_date: '2025-01-01T00:00:00.000Z',
    expected_completion_date: '2025-06-01T00:00:00.000Z',
    due_date: null,
    priority: 'Medium',
    owner: null,
    recurrence_id: null,
    kanban_sort_order: null,
    tag_ids: [],
    deleted_at: null,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeBug(overrides: Partial<Bug> = {}): Bug {
  return {
    bug_id: 'bug-1',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    title: 'Default Bug',
    description: 'A default bug description',
    status: 'New',
    severity: 'Medium',
    priority: 'Medium',
    reporter: 'user-1',
    assignee: null,
    environment: '',
    steps_to_reproduce: '',
    expected_result: '',
    actual_result: '',
    reported_at: '2025-01-01T00:00:00.000Z',
    target_fix_date: null,
    resolved_at: null,
    tag_ids: [],
    deleted_at: null,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('searchEntities', () => {
  const projects = [
    makeProject({ project_id: 'p1', name: 'Alpha Release', description: 'First release' }),
    makeProject({
      project_id: 'p2',
      name: 'Beta Testing',
      description: 'Testing alpha components',
      status: 'On Hold',
    }),
  ]

  const tasks = [
    makeTask({ task_id: 't1', title: 'Build Alpha UI', description: 'Create the user interface' }),
    makeTask({
      task_id: 't2',
      title: 'Write unit tests',
      description: 'Cover all alpha features',
      status: 'In Progress',
    }),
  ]

  const bugs = [
    makeBug({ bug_id: 'b1', title: 'Alpha crash on startup', description: 'App crashes' }),
    makeBug({
      bug_id: 'b2',
      title: 'Login failure',
      description: 'Alpha login broken',
      status: 'Triaged',
    }),
  ]

  it('returns empty array for empty query', () => {
    expect(searchEntities(projects, tasks, bugs, '')).toEqual([])
  })

  it('returns empty array for whitespace-only query', () => {
    expect(searchEntities(projects, tasks, bugs, '   ')).toEqual([])
  })

  it('returns empty array when no matches are found', () => {
    expect(searchEntities(projects, tasks, bugs, 'zzzzzzz')).toEqual([])
  })

  it('matches case-insensitively', () => {
    const results = searchEntities(projects, tasks, bugs, 'ALPHA')
    expect(results.length).toBeGreaterThan(0)

    const lowerResults = searchEntities(projects, tasks, bugs, 'alpha')
    expect(lowerResults.length).toBe(results.length)
  })

  it('title matches appear before description matches', () => {
    // "alpha" appears in titles of p1, t1, b1 and descriptions of p2, t2, b2
    const results = searchEntities(projects, tasks, bugs, 'alpha')

    const titleResults = results.filter((r) => r.matchField === 'title')
    const descResults = results.filter((r) => r.matchField === 'description')

    expect(titleResults.length).toBeGreaterThan(0)
    expect(descResults.length).toBeGreaterThan(0)

    // All title matches should come before description matches
    const lastTitleIndex = results.findIndex(
      (r) => r === titleResults[titleResults.length - 1],
    )
    const firstDescIndex = results.findIndex((r) => r === descResults[0])
    expect(lastTitleIndex).toBeLessThan(firstDescIndex)
  })

  it('does not double-count when query matches both title and description', () => {
    // "alpha" is in title "Alpha Release" AND description "Testing alpha components" for project p2
    // But for p2, "alpha" is not in the name "Beta Testing", only in description
    // For p1, "alpha" is in name "Alpha Release", so it's a title match only
    const results = searchEntities(projects, tasks, bugs, 'alpha')
    const projectResults = results.filter((r) => r.type === 'project')
    // p1 matches title, p2 matches description -> 2 project results, each counted once
    expect(projectResults.length).toBe(2)
  })

  it('filters by entity type: project only', () => {
    const results = searchEntities(projects, tasks, bugs, 'alpha', 'project')
    expect(results.every((r) => r.type === 'project')).toBe(true)
  })

  it('filters by entity type: task only', () => {
    const results = searchEntities(projects, tasks, bugs, 'alpha', 'task')
    expect(results.every((r) => r.type === 'task')).toBe(true)
  })

  it('filters by entity type: bug only', () => {
    const results = searchEntities(projects, tasks, bugs, 'alpha', 'bug')
    expect(results.every((r) => r.type === 'bug')).toBe(true)
  })

  it('filters by entity type: all returns all types', () => {
    const results = searchEntities(projects, tasks, bugs, 'alpha', 'all')
    const types = new Set(results.map((r) => r.type))
    expect(types.size).toBeGreaterThanOrEqual(2) // at least projects and tasks or bugs
  })

  it('filters by status', () => {
    const results = searchEntities(projects, tasks, bugs, 'alpha', 'all', 'On Hold')
    expect(results.length).toBe(1)
    expect(results[0].status).toBe('On Hold')
  })

  it('filters by status and entity type together', () => {
    const results = searchEntities(projects, tasks, bugs, 'alpha', 'task', 'In Progress')
    expect(results.length).toBe(1)
    expect(results[0].type).toBe('task')
    expect(results[0].status).toBe('In Progress')
  })

  it('status filter excludes non-matching statuses', () => {
    const results = searchEntities(projects, tasks, bugs, 'alpha', 'all', 'Completed')
    expect(results.length).toBe(0)
  })

  it('caps results at 50', () => {
    // Generate more than 50 projects with matching titles
    const manyProjects = Array.from({ length: 60 }, (_, i) =>
      makeProject({ project_id: `p-${i}`, name: `Search target ${i}` }),
    )

    const results = searchEntities(manyProjects, [], [], 'target')
    expect(results.length).toBe(50)
  })

  it('returns correct SearchResult shape', () => {
    const results = searchEntities(projects, tasks, bugs, 'alpha')
    const first = results[0]

    expect(first).toHaveProperty('type')
    expect(first).toHaveProperty('id')
    expect(first).toHaveProperty('projectId')
    expect(first).toHaveProperty('title')
    expect(first).toHaveProperty('description')
    expect(first).toHaveProperty('status')
    expect(first).toHaveProperty('matchField')
  })

  it('maps project fields correctly', () => {
    const results = searchEntities(projects, [], [], 'Alpha Release', 'project')
    expect(results[0].type).toBe('project')
    expect(results[0].id).toBe('p1')
    expect(results[0].projectId).toBe('p1')
    expect(results[0].title).toBe('Alpha Release')
  })

  it('maps task fields correctly', () => {
    const results = searchEntities([], tasks, [], 'Build Alpha UI', 'task')
    expect(results[0].type).toBe('task')
    expect(results[0].id).toBe('t1')
    expect(results[0].projectId).toBe('proj-1')
    expect(results[0].title).toBe('Build Alpha UI')
  })

  it('maps bug fields correctly', () => {
    const results = searchEntities([], [], bugs, 'Alpha crash', 'bug')
    expect(results[0].type).toBe('bug')
    expect(results[0].id).toBe('b1')
    expect(results[0].projectId).toBe('proj-1')
    expect(results[0].title).toBe('Alpha crash on startup')
  })
})
