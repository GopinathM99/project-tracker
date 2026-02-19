import { db } from '@/lib/firestore'
import { auth } from '@/lib/auth'
import { generateId, generateTimestamp } from '@shared/utils'
import type { Invite, WorkspaceMember } from '@shared/schemas'
import {
  doc,
  getDocs,
  query,
  where,
  writeBatch,
  updateDoc,
  collectionGroup,
  collection,
  onSnapshot,
  orderBy,
  type Unsubscribe,
} from 'firebase/firestore'

/**
 * Hash a raw token string using SHA-256 via the Web Crypto API.
 * Returns the hex-encoded hash.
 */
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const inviteService = {
  /**
   * Create an invite for a user to join a workspace.
   * Generates a random token, hashes it with SHA-256, and stores the hash.
   * Returns the raw token (not the hash) for sharing with the invitee.
   * The invite expires in 7 days.
   */
  async createInvite(
    workspaceId: string,
    email: string,
    role: 'Member' | 'Viewer',
  ): Promise<{ inviteId: string; token: string }> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to create an invite')
    }

    const inviteId = generateId()
    const rawToken = crypto.randomUUID()
    const tokenHash = await hashToken(rawToken)
    const now = generateTimestamp()

    // Expire in 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const invite: Invite = {
      invite_id: inviteId,
      workspace_id: workspaceId,
      invited_email: email,
      role,
      status: 'Pending',
      token_hash: tokenHash,
      expires_at: expiresAt,
      invited_by: user.uid,
      accepted_by_user_id: null,
      accepted_at: null,
      revoked_at: null,
      created_at: now,
      updated_at: now,
    }

    const inviteRef = doc(db, 'workspaces', workspaceId, 'invites', inviteId)
    const batch = writeBatch(db)
    batch.set(inviteRef, invite)
    await batch.commit()

    return { inviteId, token: rawToken }
  },

  /**
   * Accept an invite using a raw token.
   * 1. Hashes the raw token with SHA-256
   * 2. Queries for a pending invite matching the hash
   * 3. Verifies the invite has not expired
   * 4. Atomically updates the invite status and creates a member document
   */
  async acceptInvite(rawToken: string): Promise<{ workspaceId: string }> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to accept an invite')
    }

    const tokenHash = await hashToken(rawToken)

    // Query for the invite across all workspaces
    const invitesQuery = query(
      collectionGroup(db, 'invites'),
      where('token_hash', '==', tokenHash),
      where('status', '==', 'Pending'),
    )

    const inviteSnapshots = await getDocs(invitesQuery)

    if (inviteSnapshots.empty) {
      throw new Error('Invalid or already used invite token')
    }

    const inviteDoc = inviteSnapshots.docs[0]
    const invite = inviteDoc.data() as Invite

    // Verify the invite has not expired
    if (invite.expires_at <= new Date().toISOString()) {
      throw new Error('This invite has expired')
    }

    const now = generateTimestamp()
    const workspaceId = invite.workspace_id

    const member: WorkspaceMember = {
      membership_id: generateId(),
      workspace_id: workspaceId,
      user_id: user.uid,
      role: invite.role,
      status: 'Active',
      invited_by: invite.invited_by,
      invited_at: invite.created_at,
      accepted_at: now,
      created_at: now,
      updated_at: now,
    }

    const batch = writeBatch(db)

    // Update invite status
    batch.update(inviteDoc.ref, {
      status: 'Accepted',
      accepted_by_user_id: user.uid,
      accepted_at: now,
      updated_at: now,
    })

    // Create member doc with Firebase Auth UID as the document ID
    const memberRef = doc(db, 'workspaces', workspaceId, 'members', user.uid)
    batch.set(memberRef, member)

    await batch.commit()

    return { workspaceId }
  },

  /**
   * Revoke a pending invite.
   * Only workspace Owners should call this (enforced at the UI/rules level).
   */
  async revokeInvite(workspaceId: string, inviteId: string): Promise<void> {
    const now = generateTimestamp()
    const inviteRef = doc(db, 'workspaces', workspaceId, 'invites', inviteId)

    await updateDoc(inviteRef, {
      status: 'Revoked',
      revoked_at: now,
      updated_at: now,
    })
  },

  /**
   * Get all invites for a workspace.
   * Returns invites sorted by creation date (newest first).
   */
  async getWorkspaceInvites(workspaceId: string): Promise<Invite[]> {
    const invitesRef = collection(db, 'workspaces', workspaceId, 'invites')
    const invitesQuery = query(invitesRef, orderBy('created_at', 'desc'))
    const snapshots = await getDocs(invitesQuery)
    return snapshots.docs.map((d) => d.data() as Invite)
  },

  /**
   * Subscribe to real-time changes on all invites for a workspace.
   * Calls the callback with the full invite list on each change.
   * Returns an unsubscribe function.
   */
  subscribeToWorkspaceInvites(
    workspaceId: string,
    callback: (invites: Invite[]) => void,
  ): Unsubscribe {
    const invitesRef = collection(db, 'workspaces', workspaceId, 'invites')
    return onSnapshot(invitesRef, (snapshot) => {
      const invites = snapshot.docs.map((d) => d.data() as Invite)
      // Sort by created_at descending (newest first)
      invites.sort((a, b) => b.created_at.localeCompare(a.created_at))
      callback(invites)
    })
  },
}
