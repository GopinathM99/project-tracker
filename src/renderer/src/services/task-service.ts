import { db } from '@/lib/firestore'
import { auth } from '@/lib/auth'
import { generateId, generateTimestamp } from '@shared/utils'
import { activityLogger } from '@/services/activity-logger'
import type { Task, TaskCreate } from '@shared/schemas'
import {
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'

export const taskService = {
  async createTask(
    workspaceId: string,
    data: Omit<TaskCreate, 'workspace_id'>,
  ): Promise<Task> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to create a task')
    }

    const taskId = generateId()
    const now = generateTimestamp()

    const task: Task = {
      task_id: taskId,
      workspace_id: workspaceId,
      project_id: data.project_id,
      parent_task_id: data.parent_task_id ?? null,
      title: data.title,
      description: data.description ?? '',
      status: data.status ?? 'Not Started',
      start_date: data.start_date,
      expected_completion_date: data.expected_completion_date,
      due_date: data.due_date ?? null,
      priority: data.priority ?? 'Medium',
      owner: data.owner ?? null,
      recurrence_id: data.recurrence_id ?? null,
      kanban_sort_order: data.kanban_sort_order ?? null,
      tag_ids: data.tag_ids ?? [],
      deleted_at: null,
      created_at: now,
      updated_at: now,
    }

    const taskRef = doc(db, 'workspaces', workspaceId, 'tasks', taskId)
    await setDoc(taskRef, task)

    void activityLogger.logTaskCreated(workspaceId, task).catch(() => {})

    return task
  },

  async getTask(workspaceId: string, taskId: string): Promise<Task | null> {
    const taskRef = doc(db, 'workspaces', workspaceId, 'tasks', taskId)
    const snapshot = await getDoc(taskRef)

    if (!snapshot.exists()) {
      return null
    }

    return snapshot.data() as Task
  },

  async getProjectTasks(workspaceId: string, projectId: string): Promise<Task[]> {
    const tasksQuery = query(
      collection(db, 'workspaces', workspaceId, 'tasks'),
      where('project_id', '==', projectId),
      where('deleted_at', '==', null),
    )

    const snapshots = await getDocs(tasksQuery)
    return snapshots.docs.map((d) => d.data() as Task)
  },

  async updateTask(
    workspaceId: string,
    taskId: string,
    changes: Partial<
      Pick<
        Task,
        | 'title'
        | 'description'
        | 'status'
        | 'priority'
        | 'owner'
        | 'start_date'
        | 'expected_completion_date'
        | 'due_date'
        | 'parent_task_id'
        | 'kanban_sort_order'
        | 'tag_ids'
      >
    >,
  ): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to update a task')
    }

    // Fetch current task to detect specific changes for activity logging
    const currentTask = await this.getTask(workspaceId, taskId)

    const taskRef = doc(db, 'workspaces', workspaceId, 'tasks', taskId)
    await updateDoc(taskRef, {
      ...changes,
      updated_at: generateTimestamp(),
    })

    // Fire-and-forget activity logging
    if (currentTask) {
      const updatedTask = { ...currentTask, ...changes }
      if (changes.status && changes.status !== currentTask.status) {
        void activityLogger
          .logTaskStatusChanged(workspaceId, updatedTask, currentTask.status, changes.status)
          .catch(() => {})
      } else if (changes.owner !== undefined && changes.owner !== currentTask.owner && changes.owner) {
        void activityLogger
          .logTaskAssigned(workspaceId, updatedTask, changes.owner)
          .catch(() => {})
      } else {
        const changeDescriptions: string[] = []
        if (changes.title) changeDescriptions.push('title')
        if (changes.description !== undefined) changeDescriptions.push('description')
        if (changes.priority) changeDescriptions.push('priority')
        if (changes.due_date !== undefined) changeDescriptions.push('due date')
        if (changes.start_date) changeDescriptions.push('start date')
        if (changes.expected_completion_date) changeDescriptions.push('expected completion date')
        const desc = changeDescriptions.length > 0 ? changeDescriptions.join(', ') : 'details'
        void activityLogger
          .logTaskUpdated(workspaceId, updatedTask, desc)
          .catch(() => {})
      }
    }
  },

  async deleteTask(workspaceId: string, taskId: string): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to delete a task')
    }

    // Fetch task before deletion for the activity log
    const task = await this.getTask(workspaceId, taskId)

    const taskRef = doc(db, 'workspaces', workspaceId, 'tasks', taskId)
    await updateDoc(taskRef, {
      deleted_at: generateTimestamp(),
      updated_at: generateTimestamp(),
    })

    if (task) {
      void activityLogger
        .logTaskDeleted(workspaceId, { task_id: taskId, title: task.title, project_id: task.project_id })
        .catch(() => {})
    }
  },

  async restoreTask(workspaceId: string, taskId: string): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to restore a task')
    }

    // Fetch task before restoring for the activity log
    const task = await this.getTask(workspaceId, taskId)

    const taskRef = doc(db, 'workspaces', workspaceId, 'tasks', taskId)
    await updateDoc(taskRef, {
      deleted_at: null,
      updated_at: generateTimestamp(),
    })

    if (task) {
      void activityLogger
        .logTaskRestored(workspaceId, { task_id: taskId, title: task.title, project_id: task.project_id })
        .catch(() => {})
    }
  },

  subscribeToProjectTasks(
    workspaceId: string,
    projectId: string,
    callback: (tasks: Task[]) => void,
  ): Unsubscribe {
    const tasksQuery = query(
      collection(db, 'workspaces', workspaceId, 'tasks'),
      where('project_id', '==', projectId),
      where('deleted_at', '==', null),
    )

    return onSnapshot(tasksQuery, (snapshot) => {
      const tasks = snapshot.docs.map((d) => d.data() as Task)
      callback(tasks)
    })
  },
}

// --- Client-side filtering and sorting utilities ---

export type TaskSortField = 'title' | 'status' | 'priority' | 'due_date' | 'start_date' | 'created_at'
export type SortOrder = 'asc' | 'desc'

export interface TaskFilters {
  status?: string[]
  priority?: string[]
  owner?: string | null
  search?: string
}

const PRIORITY_ORDER: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 }
const STATUS_ORDER: Record<string, number> = { 'Not Started': 1, 'In Progress': 2, Blocked: 3, Done: 4 }

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  return tasks.filter((task) => {
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(task.status)) return false
    }

    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(task.priority)) return false
    }

    if (filters.owner !== undefined) {
      if (filters.owner === null) {
        if (task.owner !== null) return false
      } else {
        if (task.owner !== filters.owner) return false
      }
    }

    if (filters.search) {
      const term = filters.search.toLowerCase()
      if (!task.title.toLowerCase().includes(term)) return false
    }

    return true
  })
}

export function sortTasks(tasks: Task[], field: TaskSortField, order: SortOrder): Task[] {
  const sorted = [...tasks].sort((a, b) => {
    let comparison = 0

    switch (field) {
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'status':
        comparison = (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0)
        break
      case 'priority':
        comparison = (PRIORITY_ORDER[a.priority] ?? 0) - (PRIORITY_ORDER[b.priority] ?? 0)
        break
      case 'due_date': {
        if (a.due_date === null && b.due_date === null) comparison = 0
        else if (a.due_date === null) comparison = 1
        else if (b.due_date === null) comparison = -1
        else comparison = a.due_date.localeCompare(b.due_date)
        break
      }
      case 'start_date':
        comparison = a.start_date.localeCompare(b.start_date)
        break
      case 'created_at':
        comparison = a.created_at.localeCompare(b.created_at)
        break
    }

    return order === 'asc' ? comparison : -comparison
  })

  return sorted
}
