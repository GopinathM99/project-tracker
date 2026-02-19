import { db } from '@/lib/firestore'
import { auth } from '@/lib/auth'
import { generateTimestamp } from '@shared/utils'
import type { Task, Bug } from '@shared/schemas'
import { writeBatch, doc } from 'firebase/firestore'

/** Chunk an array into batches of a given size */
function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

const FIRESTORE_BATCH_LIMIT = 500

export const bulkActionService = {
  async bulkUpdateTasks(
    workspaceId: string,
    taskIds: string[],
    changes: Partial<Pick<Task, 'status' | 'priority' | 'owner'>>,
  ): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to perform bulk actions')
    }

    const now = generateTimestamp()
    const batches = chunk(taskIds, FIRESTORE_BATCH_LIMIT)

    for (const batchIds of batches) {
      const batch = writeBatch(db)
      for (const taskId of batchIds) {
        const taskRef = doc(db, 'workspaces', workspaceId, 'tasks', taskId)
        batch.update(taskRef, {
          ...changes,
          updated_at: now,
        })
      }
      await batch.commit()
    }
  },

  async bulkDeleteTasks(
    workspaceId: string,
    taskIds: string[],
  ): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to perform bulk actions')
    }

    const now = generateTimestamp()
    const batches = chunk(taskIds, FIRESTORE_BATCH_LIMIT)

    for (const batchIds of batches) {
      const batch = writeBatch(db)
      for (const taskId of batchIds) {
        const taskRef = doc(db, 'workspaces', workspaceId, 'tasks', taskId)
        batch.update(taskRef, {
          deleted_at: now,
          updated_at: now,
        })
      }
      await batch.commit()
    }
  },

  async bulkUpdateBugs(
    workspaceId: string,
    bugIds: string[],
    changes: Partial<Pick<Bug, 'status' | 'priority' | 'assignee'>>,
  ): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to perform bulk actions')
    }

    const now = generateTimestamp()
    const batches = chunk(bugIds, FIRESTORE_BATCH_LIMIT)

    for (const batchIds of batches) {
      const batch = writeBatch(db)
      for (const bugId of batchIds) {
        const bugRef = doc(db, 'workspaces', workspaceId, 'bugs', bugId)
        batch.update(bugRef, {
          ...changes,
          updated_at: now,
        })
      }
      await batch.commit()
    }
  },

  async bulkDeleteBugs(
    workspaceId: string,
    bugIds: string[],
  ): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to perform bulk actions')
    }

    const now = generateTimestamp()
    const batches = chunk(bugIds, FIRESTORE_BATCH_LIMIT)

    for (const batchIds of batches) {
      const batch = writeBatch(db)
      for (const bugId of batchIds) {
        const bugRef = doc(db, 'workspaces', workspaceId, 'bugs', bugId)
        batch.update(bugRef, {
          deleted_at: now,
          updated_at: now,
        })
      }
      await batch.commit()
    }
  },
}
