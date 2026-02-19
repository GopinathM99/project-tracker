import { db } from '@/lib/firestore'
import type { WorkspaceMember } from '@shared/schemas'
import { doc, getDoc, getDocs, collection, updateDoc, query, where } from 'firebase/firestore'
import { generateTimestamp } from '@shared/utils'

export const memberService = {
  /**
   * Get a specific user's membership in a workspace.
   * Member doc ID is the Firebase Auth UID.
   * Returns null if no membership exists.
   */
  async getWorkspaceMembership(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMember | null> {
    const memberRef = doc(db, 'workspaces', workspaceId, 'members', userId)
    const snapshot = await getDoc(memberRef)

    if (!snapshot.exists()) {
      return null
    }

    return snapshot.data() as WorkspaceMember
  },

  /**
   * Get all active members of a workspace.
   */
  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const membersRef = collection(db, 'workspaces', workspaceId, 'members')
    const membersQuery = query(membersRef, where('status', '==', 'Active'))
    const snapshot = await getDocs(membersQuery)

    return snapshot.docs.map((doc) => doc.data() as WorkspaceMember)
  },

  /**
   * Update a member's role.
   * Only workspace Owners should call this (enforced at the UI/rules level).
   */
  async updateMemberRole(
    workspaceId: string,
    userId: string,
    role: 'Owner' | 'Member' | 'Viewer',
  ): Promise<void> {
    const memberRef = doc(db, 'workspaces', workspaceId, 'members', userId)
    await updateDoc(memberRef, {
      role,
      updated_at: generateTimestamp(),
    })
  },

  /**
   * Remove a member by setting their status to 'Removed'.
   * Does not delete the document, preserving audit history.
   */
  async removeMember(workspaceId: string, userId: string): Promise<void> {
    const memberRef = doc(db, 'workspaces', workspaceId, 'members', userId)
    await updateDoc(memberRef, {
      status: 'Removed',
      updated_at: generateTimestamp(),
    })
  },
}
