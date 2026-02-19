import { describe, it, expect, beforeEach } from 'vitest'
import { useTaskStore } from '@/stores/taskStore'
import type { Task } from '@shared/schemas'

const mockTask: Task = {
  task_id: 'task-1',
  workspace_id: 'ws-1',
  project_id: 'proj-1',
  parent_task_id: null,
  title: 'Test Task',
  description: 'A test task',
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

const mockTask2: Task = {
  ...mockTask,
  task_id: 'task-2',
  title: 'Second Task',
}

describe('taskStore', () => {
  beforeEach(() => {
    useTaskStore.getState().clear()
  })

  it('has correct initial state', () => {
    const state = useTaskStore.getState()
    expect(state.tasks).toEqual([])
    expect(state.currentTask).toBeNull()
    expect(state.loading).toBe(false)
    expect(state.filters).toEqual({})
    expect(state.sortField).toBe('created_at')
    expect(state.sortOrder).toBe('asc')
  })

  it('setTasks updates the tasks array', () => {
    useTaskStore.getState().setTasks([mockTask, mockTask2])
    expect(useTaskStore.getState().tasks).toEqual([mockTask, mockTask2])
  })

  it('setCurrentTask updates currentTask', () => {
    useTaskStore.getState().setCurrentTask(mockTask)
    expect(useTaskStore.getState().currentTask).toEqual(mockTask)
  })

  it('setCurrentTask to null clears currentTask', () => {
    useTaskStore.getState().setCurrentTask(mockTask)
    useTaskStore.getState().setCurrentTask(null)
    expect(useTaskStore.getState().currentTask).toBeNull()
  })

  it('updateTask updates a task in the array', () => {
    useTaskStore.getState().setTasks([mockTask, mockTask2])
    useTaskStore.getState().updateTask('task-1', { title: 'Updated Title' })

    const tasks = useTaskStore.getState().tasks
    expect(tasks[0].title).toBe('Updated Title')
    expect(tasks[1].title).toBe('Second Task')
  })

  it('updateTask also updates currentTask if it matches', () => {
    useTaskStore.getState().setTasks([mockTask])
    useTaskStore.getState().setCurrentTask(mockTask)
    useTaskStore.getState().updateTask('task-1', { title: 'Updated Title' })

    expect(useTaskStore.getState().currentTask?.title).toBe('Updated Title')
  })

  it('updateTask does not affect currentTask if it does not match', () => {
    useTaskStore.getState().setTasks([mockTask, mockTask2])
    useTaskStore.getState().setCurrentTask(mockTask)
    useTaskStore.getState().updateTask('task-2', { title: 'Updated Second' })

    expect(useTaskStore.getState().currentTask?.title).toBe('Test Task')
  })

  it('removeTask removes from the array', () => {
    useTaskStore.getState().setTasks([mockTask, mockTask2])
    useTaskStore.getState().removeTask('task-1')

    const tasks = useTaskStore.getState().tasks
    expect(tasks).toHaveLength(1)
    expect(tasks[0].task_id).toBe('task-2')
  })

  it('removeTask clears currentTask if it matches', () => {
    useTaskStore.getState().setTasks([mockTask, mockTask2])
    useTaskStore.getState().setCurrentTask(mockTask)
    useTaskStore.getState().removeTask('task-1')

    expect(useTaskStore.getState().currentTask).toBeNull()
  })

  it('removeTask does not affect currentTask if it does not match', () => {
    useTaskStore.getState().setTasks([mockTask, mockTask2])
    useTaskStore.getState().setCurrentTask(mockTask)
    useTaskStore.getState().removeTask('task-2')

    expect(useTaskStore.getState().currentTask).toEqual(mockTask)
  })

  it('setLoading updates loading', () => {
    useTaskStore.getState().setLoading(true)
    expect(useTaskStore.getState().loading).toBe(true)
  })

  it('setFilters updates filters', () => {
    const filters = { status: ['Done'], priority: ['High'] }
    useTaskStore.getState().setFilters(filters)
    expect(useTaskStore.getState().filters).toEqual(filters)
  })

  it('setSorting updates sortField and sortOrder', () => {
    useTaskStore.getState().setSorting('priority', 'desc')
    expect(useTaskStore.getState().sortField).toBe('priority')
    expect(useTaskStore.getState().sortOrder).toBe('desc')
  })

  it('clear resets all state', () => {
    useTaskStore.getState().setTasks([mockTask])
    useTaskStore.getState().setCurrentTask(mockTask)
    useTaskStore.getState().setLoading(true)
    useTaskStore.getState().setFilters({ status: ['Done'] })
    useTaskStore.getState().setSorting('priority', 'desc')

    useTaskStore.getState().clear()

    const state = useTaskStore.getState()
    expect(state.tasks).toEqual([])
    expect(state.currentTask).toBeNull()
    expect(state.loading).toBe(false)
    expect(state.filters).toEqual({})
    expect(state.sortField).toBe('created_at')
    expect(state.sortOrder).toBe('asc')
  })
})
