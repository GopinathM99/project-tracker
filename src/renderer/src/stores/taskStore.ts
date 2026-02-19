import { create } from 'zustand'
import type { Task } from '@shared/schemas'

export type TaskSortField = 'title' | 'status' | 'priority' | 'due_date' | 'start_date' | 'created_at'
export type SortOrder = 'asc' | 'desc'

export interface TaskFilters {
  status?: string[]
  priority?: string[]
  owner?: string | null
  search?: string
}

interface TaskState {
  tasks: Task[]
  currentTask: Task | null
  loading: boolean
  filters: TaskFilters
  sortField: TaskSortField
  sortOrder: SortOrder
  setTasks: (tasks: Task[]) => void
  setCurrentTask: (task: Task | null) => void
  updateTask: (taskId: string, changes: Partial<Task>) => void
  removeTask: (taskId: string) => void
  setLoading: (loading: boolean) => void
  setFilters: (filters: TaskFilters) => void
  setSorting: (field: TaskSortField, order: SortOrder) => void
  clear: () => void
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  currentTask: null,
  loading: false,
  filters: {},
  sortField: 'created_at',
  sortOrder: 'asc',
  setTasks: (tasks) => set({ tasks }),
  setCurrentTask: (currentTask) => set({ currentTask }),
  updateTask: (taskId, changes) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.task_id === taskId ? { ...t, ...changes } : t
      ),
      currentTask:
        state.currentTask?.task_id === taskId
          ? { ...state.currentTask, ...changes }
          : state.currentTask,
    })),
  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.task_id !== taskId),
      currentTask:
        state.currentTask?.task_id === taskId ? null : state.currentTask,
    })),
  setLoading: (loading) => set({ loading }),
  setFilters: (filters) => set({ filters }),
  setSorting: (sortField, sortOrder) => set({ sortField, sortOrder }),
  clear: () => set({ tasks: [], currentTask: null, loading: false, filters: {}, sortField: 'created_at', sortOrder: 'asc' }),
}))
