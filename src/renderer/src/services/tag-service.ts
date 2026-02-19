import { db } from '@/lib/firestore'
import { auth } from '@/lib/auth'
import { generateId, generateTimestamp } from '@shared/utils'
import type { Tag, TagCreate } from '@shared/schemas'
import {
  doc,
  collection,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'

export const tagService = {
  async createTag(
    workspaceId: string,
    data: Omit<TagCreate, 'workspace_id'>,
  ): Promise<Tag> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to create a tag')
    }

    const tagId = generateId()
    const now = generateTimestamp()

    const tag: Tag = {
      tag_id: tagId,
      workspace_id: workspaceId,
      name: data.name,
      color: data.color,
      scope: data.scope,
      project_id: data.project_id ?? null,
      created_at: now,
      updated_at: now,
    }

    const tagRef = doc(db, 'workspaces', workspaceId, 'tags', tagId)
    await setDoc(tagRef, tag)

    return tag
  },

  async getWorkspaceTags(workspaceId: string): Promise<Tag[]> {
    const tagsCol = collection(db, 'workspaces', workspaceId, 'tags')
    const snapshots = await getDocs(tagsCol)
    return snapshots.docs.map((d) => d.data() as Tag)
  },

  async updateTag(
    workspaceId: string,
    tagId: string,
    changes: Partial<Pick<Tag, 'name' | 'color'>>,
  ): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to update a tag')
    }

    const tagRef = doc(db, 'workspaces', workspaceId, 'tags', tagId)
    await updateDoc(tagRef, {
      ...changes,
      updated_at: generateTimestamp(),
    })
  },

  async deleteTag(workspaceId: string, tagId: string): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to delete a tag')
    }

    // Remove this tag from any projects that reference it
    const projectsQuery = query(
      collection(db, 'workspaces', workspaceId, 'projects'),
      where('deleted_at', '==', null),
    )
    const projectSnapshots = await getDocs(projectsQuery)

    for (const projectDoc of projectSnapshots.docs) {
      const projectData = projectDoc.data()
      const tagIds: string[] = projectData.tag_ids ?? []
      if (tagIds.includes(tagId)) {
        const updatedTagIds = tagIds.filter((id) => id !== tagId)
        await updateDoc(projectDoc.ref, {
          tag_ids: updatedTagIds,
          updated_at: generateTimestamp(),
        })
      }
    }

    // Remove this tag from any tasks that reference it
    const tasksQuery = query(
      collection(db, 'workspaces', workspaceId, 'tasks'),
      where('deleted_at', '==', null),
    )
    const taskSnapshots = await getDocs(tasksQuery)

    for (const taskDoc of taskSnapshots.docs) {
      const taskData = taskDoc.data()
      const tagIds: string[] = taskData.tag_ids ?? []
      if (tagIds.includes(tagId)) {
        const updatedTagIds = tagIds.filter((id) => id !== tagId)
        await updateDoc(taskDoc.ref, {
          tag_ids: updatedTagIds,
          updated_at: generateTimestamp(),
        })
      }
    }

    // Hard delete the tag
    const tagRef = doc(db, 'workspaces', workspaceId, 'tags', tagId)
    await deleteDoc(tagRef)
  },

  subscribeToTags(
    workspaceId: string,
    callback: (tags: Tag[]) => void,
  ): Unsubscribe {
    const tagsCol = collection(db, 'workspaces', workspaceId, 'tags')

    return onSnapshot(tagsCol, (snapshot) => {
      const tags = snapshot.docs.map((d) => d.data() as Tag)
      callback(tags)
    })
  },
}
