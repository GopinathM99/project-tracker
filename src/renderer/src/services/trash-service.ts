import { db } from '@/lib/firestore'
import { auth } from '@/lib/auth'
import type { Task, Bug, Project } from '@shared/schemas'
import { FIELD_LIMITS } from '@shared/constants/validation'
import {
  doc,
  collection,
  getDocs,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore'

export const trashService = {
  async getDeletedTasks(workspaceId: string): Promise<Task[]> {
    const tasksQuery = query(
      collection(db, 'workspaces', workspaceId, 'tasks'),
      where('deleted_at', '!=', null),
    )
    const snapshots = await getDocs(tasksQuery)
    return snapshots.docs.map((d) => d.data() as Task)
  },

  async getDeletedBugs(workspaceId: string): Promise<Bug[]> {
    const bugsQuery = query(
      collection(db, 'workspaces', workspaceId, 'bugs'),
      where('deleted_at', '!=', null),
    )
    const snapshots = await getDocs(bugsQuery)
    return snapshots.docs.map((d) => d.data() as Bug)
  },

  async getDeletedProjects(workspaceId: string): Promise<Project[]> {
    const projectsQuery = query(
      collection(db, 'workspaces', workspaceId, 'projects'),
      where('deleted_at', '!=', null),
    )
    const snapshots = await getDocs(projectsQuery)
    return snapshots.docs.map((d) => d.data() as Project)
  },

  async permanentlyDeleteTask(workspaceId: string, taskId: string): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to permanently delete a task')
    }
    const taskRef = doc(db, 'workspaces', workspaceId, 'tasks', taskId)
    await deleteDoc(taskRef)
  },

  async permanentlyDeleteBug(workspaceId: string, bugId: string): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to permanently delete a bug')
    }
    const bugRef = doc(db, 'workspaces', workspaceId, 'bugs', bugId)
    await deleteDoc(bugRef)
  },

  async permanentlyDeleteProject(workspaceId: string, projectId: string): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to permanently delete a project')
    }
    const projectRef = doc(db, 'workspaces', workspaceId, 'projects', projectId)
    await deleteDoc(projectRef)
  },

  async purgeExpired(workspaceId: string): Promise<number> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to purge expired items')
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - FIELD_LIMITS.TRASH_PURGE_DAYS)
    const cutoff = cutoffDate.toISOString()

    let purgedCount = 0

    // Purge expired tasks
    const tasks = await this.getDeletedTasks(workspaceId)
    for (const task of tasks) {
      if (task.deleted_at && task.deleted_at < cutoff) {
        await this.permanentlyDeleteTask(workspaceId, task.task_id)
        purgedCount++
      }
    }

    // Purge expired bugs
    const bugs = await this.getDeletedBugs(workspaceId)
    for (const bug of bugs) {
      if (bug.deleted_at && bug.deleted_at < cutoff) {
        await this.permanentlyDeleteBug(workspaceId, bug.bug_id)
        purgedCount++
      }
    }

    // Purge expired projects
    const projects = await this.getDeletedProjects(workspaceId)
    for (const project of projects) {
      if (project.deleted_at && project.deleted_at < cutoff) {
        await this.permanentlyDeleteProject(workspaceId, project.project_id)
        purgedCount++
      }
    }

    return purgedCount
  },
}
