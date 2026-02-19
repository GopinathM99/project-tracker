import { db } from '@/lib/firestore'
import { auth } from '@/lib/auth'
import { generateId, generateTimestamp } from '@shared/utils'
import { activityLogger } from '@/services/activity-logger'
import type { Project, ProjectCreate } from '@shared/schemas'
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

export const projectService = {
  async createProject(
    workspaceId: string,
    data: Omit<ProjectCreate, 'workspace_id' | 'owner'>,
  ): Promise<Project> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to create a project')
    }

    const projectId = generateId()
    const now = generateTimestamp()

    const project: Project = {
      project_id: projectId,
      workspace_id: workspaceId,
      folder_id: data.folder_id ?? null,
      name: data.name,
      description: data.description ?? '',
      status: data.status ?? 'Active',
      owner: user.uid,
      start_date: data.start_date,
      target_end_date: data.target_end_date,
      tag_ids: data.tag_ids ?? [],
      deleted_at: null,
      created_at: now,
      updated_at: now,
    }

    const projectRef = doc(db, 'workspaces', workspaceId, 'projects', projectId)
    await setDoc(projectRef, project)

    void activityLogger.logProjectCreated(workspaceId, project).catch(() => {})

    return project
  },

  async getProject(workspaceId: string, projectId: string): Promise<Project | null> {
    const projectRef = doc(db, 'workspaces', workspaceId, 'projects', projectId)
    const snapshot = await getDoc(projectRef)

    if (!snapshot.exists()) {
      return null
    }

    return snapshot.data() as Project
  },

  async getWorkspaceProjects(workspaceId: string): Promise<Project[]> {
    const projectsQuery = query(
      collection(db, 'workspaces', workspaceId, 'projects'),
      where('deleted_at', '==', null),
    )

    const snapshots = await getDocs(projectsQuery)
    return snapshots.docs.map((d) => d.data() as Project)
  },

  async updateProject(
    workspaceId: string,
    projectId: string,
    changes: Partial<
      Pick<
        Project,
        'name' | 'description' | 'status' | 'start_date' | 'target_end_date' | 'folder_id' | 'tag_ids'
      >
    >,
  ): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to update a project')
    }

    // Fetch current project for activity logging
    const currentProject = await this.getProject(workspaceId, projectId)

    const projectRef = doc(db, 'workspaces', workspaceId, 'projects', projectId)
    await updateDoc(projectRef, {
      ...changes,
      updated_at: generateTimestamp(),
    })

    // Fire-and-forget activity logging
    if (currentProject) {
      const updatedProject = { ...currentProject, ...changes }
      const changeDescriptions: string[] = []
      if (changes.name) changeDescriptions.push('name')
      if (changes.description !== undefined) changeDescriptions.push('description')
      if (changes.status) changeDescriptions.push('status')
      if (changes.start_date) changeDescriptions.push('start date')
      if (changes.target_end_date) changeDescriptions.push('target end date')
      const desc = changeDescriptions.length > 0 ? changeDescriptions.join(', ') : 'details'
      void activityLogger
        .logProjectUpdated(workspaceId, updatedProject, desc)
        .catch(() => {})
    }
  },

  async archiveProject(workspaceId: string, projectId: string): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to archive a project')
    }

    const project = await this.getProject(workspaceId, projectId)

    const projectRef = doc(db, 'workspaces', workspaceId, 'projects', projectId)
    await updateDoc(projectRef, {
      status: 'Archived',
      updated_at: generateTimestamp(),
    })

    if (project) {
      void activityLogger.logProjectArchived(workspaceId, project).catch(() => {})
    }
  },

  async unarchiveProject(workspaceId: string, projectId: string): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to unarchive a project')
    }

    const project = await this.getProject(workspaceId, projectId)

    const projectRef = doc(db, 'workspaces', workspaceId, 'projects', projectId)
    await updateDoc(projectRef, {
      status: 'Active',
      updated_at: generateTimestamp(),
    })

    if (project) {
      void activityLogger.logProjectUnarchived(workspaceId, project).catch(() => {})
    }
  },

  async deleteProject(workspaceId: string, projectId: string): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to delete a project')
    }

    const project = await this.getProject(workspaceId, projectId)

    const projectRef = doc(db, 'workspaces', workspaceId, 'projects', projectId)
    await updateDoc(projectRef, {
      deleted_at: generateTimestamp(),
      updated_at: generateTimestamp(),
    })

    if (project) {
      void activityLogger
        .logProjectDeleted(workspaceId, { project_id: projectId, name: project.name })
        .catch(() => {})
    }
  },

  subscribeToProjects(
    workspaceId: string,
    callback: (projects: Project[]) => void,
  ): Unsubscribe {
    const projectsQuery = query(
      collection(db, 'workspaces', workspaceId, 'projects'),
      where('deleted_at', '==', null),
    )

    return onSnapshot(projectsQuery, (snapshot) => {
      const projects = snapshot.docs.map((d) => d.data() as Project)
      callback(projects)
    })
  },

  subscribeToProject(
    workspaceId: string,
    projectId: string,
    callback: (project: Project | null) => void,
  ): Unsubscribe {
    const projectRef = doc(db, 'workspaces', workspaceId, 'projects', projectId)

    return onSnapshot(projectRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as Project)
      } else {
        callback(null)
      }
    })
  },
}
