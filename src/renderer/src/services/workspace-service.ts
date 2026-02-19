import { db } from '@/lib/firestore'
import { auth } from '@/lib/auth'
import { generateId, generateTimestamp } from '@shared/utils'
import type { Workspace, WorkspaceMember } from '@shared/schemas'
import {
  doc,
  collection,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
  onSnapshot,
  collectionGroup,
  type Unsubscribe,
} from 'firebase/firestore'

/**
 * Generate a URL-safe slug from a workspace name.
 * Lowercases, replaces whitespace with hyphens, strips non-alphanumeric/hyphen chars,
 * and truncates to 100 characters.
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 100)
}

export const workspaceService = {
  /**
   * Create a new workspace and owner membership atomically using a batch write.
   * The current authenticated user becomes the workspace owner.
   */
  async createWorkspace(name: string): Promise<Workspace> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to create a workspace')
    }

    const workspaceId = generateId()
    const now = generateTimestamp()
    const slug = generateSlug(name)

    const workspace: Workspace = {
      workspace_id: workspaceId,
      name,
      slug,
      owner_user_id: user.uid,
      plan_tier: null,
      created_at: now,
      updated_at: now,
    }

    const ownerMember: WorkspaceMember = {
      membership_id: generateId(),
      workspace_id: workspaceId,
      user_id: user.uid,
      role: 'Owner',
      status: 'Active',
      invited_by: null,
      invited_at: null,
      accepted_at: null,
      created_at: now,
      updated_at: now,
    }

    const batch = writeBatch(db)

    const workspaceRef = doc(db, 'workspaces', workspaceId)
    batch.set(workspaceRef, workspace)

    // Member doc ID is the Firebase Auth UID
    const memberRef = doc(db, 'workspaces', workspaceId, 'members', user.uid)
    batch.set(memberRef, ownerMember)

    await batch.commit()

    return workspace
  },

  /**
   * Get a single workspace by its ID.
   * Returns null if the workspace does not exist.
   */
  async getWorkspace(workspaceId: string): Promise<Workspace | null> {
    const workspaceRef = doc(db, 'workspaces', workspaceId)
    const snapshot = await getDoc(workspaceRef)

    if (!snapshot.exists()) {
      return null
    }

    return snapshot.data() as Workspace
  },

  /**
   * Get all workspaces where the current user is an active member.
   * Uses collectionGroup query on 'members' subcollection, then fetches
   * each parent workspace document.
   */
  async getUserWorkspaces(): Promise<Workspace[]> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to get workspaces')
    }

    const membersQuery = query(
      collectionGroup(db, 'members'),
      where('user_id', '==', user.uid),
      where('status', '==', 'Active'),
    )

    const memberSnapshots = await getDocs(membersQuery)
    const workspaces: Workspace[] = []

    for (const memberDoc of memberSnapshots.docs) {
      // Navigate from member doc to parent workspace doc:
      // workspaces/{workspaceId}/members/{userId} -> workspaces/{workspaceId}
      const workspaceRef = memberDoc.ref.parent.parent
      if (!workspaceRef) continue

      const workspaceSnapshot = await getDoc(workspaceRef)
      if (workspaceSnapshot.exists()) {
        workspaces.push(workspaceSnapshot.data() as Workspace)
      }
    }

    return workspaces
  },

  /**
   * Subscribe to real-time changes on a workspace document.
   * Calls the callback with the workspace data on each change,
   * or null if the document is deleted.
   * Returns an unsubscribe function.
   */
  subscribeToWorkspace(
    workspaceId: string,
    callback: (workspace: Workspace | null) => void,
  ): Unsubscribe {
    const workspaceRef = doc(db, 'workspaces', workspaceId)

    return onSnapshot(workspaceRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as Workspace)
      } else {
        callback(null)
      }
    })
  },
}
