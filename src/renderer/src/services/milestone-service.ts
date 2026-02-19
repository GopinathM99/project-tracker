import { db } from '@/lib/firestore'
import { auth } from '@/lib/auth'
import { generateId, generateTimestamp } from '@shared/utils'
import type { Milestone, MilestoneCreate } from '@shared/schemas'
import {
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'

export const milestoneService = {
  async createMilestone(
    workspaceId: string,
    projectId: string,
    data: Omit<MilestoneCreate, 'workspace_id' | 'project_id'>,
  ): Promise<Milestone> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to create a milestone')
    }

    const milestoneId = generateId()
    const now = generateTimestamp()

    const milestone: Milestone = {
      milestone_id: milestoneId,
      workspace_id: workspaceId,
      project_id: projectId,
      title: data.title,
      description: data.description ?? '',
      status: data.status ?? 'Planned',
      start_date: data.start_date ?? null,
      target_date: data.target_date,
      completed_at: null,
      owner: data.owner ?? null,
      linked_task_ids: data.linked_task_ids ?? [],
      created_at: now,
      updated_at: now,
    }

    const milestoneRef = doc(db, 'workspaces', workspaceId, 'milestones', milestoneId)
    await setDoc(milestoneRef, milestone)

    return milestone
  },

  async getMilestone(workspaceId: string, milestoneId: string): Promise<Milestone | null> {
    const milestoneRef = doc(db, 'workspaces', workspaceId, 'milestones', milestoneId)
    const snapshot = await getDoc(milestoneRef)

    if (!snapshot.exists()) {
      return null
    }

    return snapshot.data() as Milestone
  },

  async getProjectMilestones(workspaceId: string, projectId: string): Promise<Milestone[]> {
    const milestonesQuery = query(
      collection(db, 'workspaces', workspaceId, 'milestones'),
      where('project_id', '==', projectId),
    )

    const snapshots = await getDocs(milestonesQuery)
    return snapshots.docs.map((d) => d.data() as Milestone)
  },

  async updateMilestone(
    workspaceId: string,
    milestoneId: string,
    changes: Partial<
      Pick<
        Milestone,
        | 'title'
        | 'description'
        | 'status'
        | 'start_date'
        | 'target_date'
        | 'completed_at'
        | 'owner'
        | 'linked_task_ids'
      >
    >,
  ): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to update a milestone')
    }

    const milestoneRef = doc(db, 'workspaces', workspaceId, 'milestones', milestoneId)
    await updateDoc(milestoneRef, {
      ...changes,
      updated_at: generateTimestamp(),
    })
  },

  async deleteMilestone(workspaceId: string, milestoneId: string): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to delete a milestone')
    }

    const milestoneRef = doc(db, 'workspaces', workspaceId, 'milestones', milestoneId)
    await deleteDoc(milestoneRef)
  },

  subscribeToProjectMilestones(
    workspaceId: string,
    projectId: string,
    callback: (milestones: Milestone[]) => void,
  ): Unsubscribe {
    const milestonesQuery = query(
      collection(db, 'workspaces', workspaceId, 'milestones'),
      where('project_id', '==', projectId),
    )

    return onSnapshot(milestonesQuery, (snapshot) => {
      const milestones = snapshot.docs.map((d) => d.data() as Milestone)
      callback(milestones)
    })
  },

  async linkTask(workspaceId: string, milestoneId: string, taskId: string): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to link a task')
    }

    const milestone = await milestoneService.getMilestone(workspaceId, milestoneId)
    if (!milestone) {
      throw new Error('Milestone not found')
    }

    if (milestone.linked_task_ids.includes(taskId)) {
      return // Already linked
    }

    const milestoneRef = doc(db, 'workspaces', workspaceId, 'milestones', milestoneId)
    await updateDoc(milestoneRef, {
      linked_task_ids: [...milestone.linked_task_ids, taskId],
      updated_at: generateTimestamp(),
    })
  },

  async unlinkTask(workspaceId: string, milestoneId: string, taskId: string): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to unlink a task')
    }

    const milestone = await milestoneService.getMilestone(workspaceId, milestoneId)
    if (!milestone) {
      throw new Error('Milestone not found')
    }

    const milestoneRef = doc(db, 'workspaces', workspaceId, 'milestones', milestoneId)
    await updateDoc(milestoneRef, {
      linked_task_ids: milestone.linked_task_ids.filter((id) => id !== taskId),
      updated_at: generateTimestamp(),
    })
  },
}
