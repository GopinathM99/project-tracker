import { db } from '@/lib/firestore'
import { auth } from '@/lib/auth'
import { generateId, generateTimestamp } from '@shared/utils'
import type { Folder, FolderCreate } from '@shared/schemas'
import {
  doc,
  collection,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { projectService } from './project-service'

export const folderService = {
  async createFolder(
    workspaceId: string,
    data: Omit<FolderCreate, 'workspace_id'>,
  ): Promise<Folder> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to create a folder')
    }

    const folderId = generateId()
    const now = generateTimestamp()

    const folder: Folder = {
      folder_id: folderId,
      workspace_id: workspaceId,
      name: data.name,
      parent_folder_id: data.parent_folder_id ?? null,
      sort_order: data.sort_order ?? 0,
      created_at: now,
      updated_at: now,
    }

    const folderRef = doc(db, 'workspaces', workspaceId, 'folders', folderId)
    await setDoc(folderRef, folder)

    return folder
  },

  async getWorkspaceFolders(workspaceId: string): Promise<Folder[]> {
    const foldersCol = collection(db, 'workspaces', workspaceId, 'folders')
    const snapshots = await getDocs(foldersCol)
    return snapshots.docs.map((d) => d.data() as Folder)
  },

  async updateFolder(
    workspaceId: string,
    folderId: string,
    changes: Partial<Pick<Folder, 'name' | 'parent_folder_id' | 'sort_order'>>,
  ): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to update a folder')
    }

    const folderRef = doc(db, 'workspaces', workspaceId, 'folders', folderId)
    await updateDoc(folderRef, {
      ...changes,
      updated_at: generateTimestamp(),
    })
  },

  async deleteFolder(workspaceId: string, folderId: string): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to delete a folder')
    }

    // Null out folder_id on any projects in this folder
    const projects = await projectService.getWorkspaceProjects(workspaceId)
    const projectsInFolder = projects.filter((p) => p.folder_id === folderId)

    for (const project of projectsInFolder) {
      await projectService.updateProject(workspaceId, project.project_id, {
        folder_id: null,
      })
    }

    // Hard delete the folder
    const folderRef = doc(db, 'workspaces', workspaceId, 'folders', folderId)
    await deleteDoc(folderRef)
  },

  subscribeToFolders(
    workspaceId: string,
    callback: (folders: Folder[]) => void,
  ): Unsubscribe {
    const foldersCol = collection(db, 'workspaces', workspaceId, 'folders')

    return onSnapshot(foldersCol, (snapshot) => {
      const folders = snapshot.docs.map((d) => d.data() as Folder)
      callback(folders)
    })
  },
}
