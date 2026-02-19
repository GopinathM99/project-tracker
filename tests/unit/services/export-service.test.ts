import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/firebase', () => ({ app: {} }))
vi.mock('@/lib/firestore', () => ({ db: {} }))
vi.mock('@/lib/auth', () => ({ auth: {} }))
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  collection: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
}))

import { exportService } from '@/services/export-service'

describe('parseImportCSV', () => {
  it('parses basic CSV with headers and rows', () => {
    const csv = 'title,status,priority\nFix login,Done,High\nAdd tests,Not Started,Medium'
    const result = exportService.parseImportCSV(csv)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ title: 'Fix login', status: 'Done', priority: 'High' })
    expect(result[1]).toEqual({ title: 'Add tests', status: 'Not Started', priority: 'Medium' })
  })

  it('handles quoted fields with commas', () => {
    const csv = 'title,description\nTask One,"Has a , comma"\nTask Two,Simple'
    const result = exportService.parseImportCSV(csv)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ title: 'Task One', description: 'Has a , comma' })
    expect(result[1]).toEqual({ title: 'Task Two', description: 'Simple' })
  })

  it('returns empty array for empty input', () => {
    const result = exportService.parseImportCSV('')
    expect(result).toEqual([])
  })

  it('returns empty array for header-only CSV', () => {
    const result = exportService.parseImportCSV('title,status,priority')
    expect(result).toEqual([])
  })

  it('trims whitespace from headers', () => {
    const csv = ' title , status \nFix bug,Done'
    const result = exportService.parseImportCSV(csv)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ title: 'Fix bug', status: 'Done' })
  })
})

describe('parseImportJSON', () => {
  it('parses valid JSON with projects and tasks', () => {
    const json = JSON.stringify({
      projects: [{ project_id: 'proj-1', name: 'Test' }],
      tasks: [{ task_id: 'task-1', title: 'Do thing' }],
    })
    const result = exportService.parseImportJSON(json)

    expect(result.projects).toHaveLength(1)
    expect(result.projects[0].project_id).toBe('proj-1')
    expect(result.tasks).toHaveLength(1)
    expect(result.tasks[0].task_id).toBe('task-1')
  })

  it('defaults to empty arrays for missing fields', () => {
    const json = JSON.stringify({})
    const result = exportService.parseImportJSON(json)

    expect(result.projects).toEqual([])
    expect(result.tasks).toEqual([])
  })

  it('defaults tasks to empty array if only projects are present', () => {
    const json = JSON.stringify({ projects: [{ project_id: 'proj-1' }] })
    const result = exportService.parseImportJSON(json)

    expect(result.projects).toHaveLength(1)
    expect(result.tasks).toEqual([])
  })

  it('defaults projects to empty array if only tasks are present', () => {
    const json = JSON.stringify({ tasks: [{ task_id: 'task-1' }] })
    const result = exportService.parseImportJSON(json)

    expect(result.projects).toEqual([])
    expect(result.tasks).toHaveLength(1)
  })

  it('throws on invalid JSON', () => {
    expect(() => exportService.parseImportJSON('not valid json')).toThrow()
  })
})
