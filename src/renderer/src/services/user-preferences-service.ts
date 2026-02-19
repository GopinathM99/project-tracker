import { db } from '@/lib/firestore'
import { auth } from '@/lib/auth'
import { generateTimestamp } from '@shared/utils'
import type { UserPreferences } from '@shared/schemas'
import { doc, getDoc, setDoc, updateDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore'

function getPreferencesRef(workspaceId: string, userId: string) {
  return doc(db, 'workspaces', workspaceId, 'user_preferences', userId)
}

export const userPreferencesService = {
  async getPreferences(workspaceId: string): Promise<UserPreferences | null> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to get preferences')
    }

    const ref = getPreferencesRef(workspaceId, user.uid)
    const snapshot = await getDoc(ref)

    if (!snapshot.exists()) {
      return null
    }

    return snapshot.data() as UserPreferences
  },

  async createDefaultPreferences(workspaceId: string): Promise<UserPreferences> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to create preferences')
    }

    const now = generateTimestamp()

    const defaults: UserPreferences = {
      user_id: user.uid,
      workspace_id: workspaceId,
      theme: 'System',
      default_view: 'Dashboard',
      notification_reminders: true,
      notification_overdue: true,
      notification_assignments: true,
      notification_comments: true,
      notification_status_changes: true,
      sidebar_collapsed: false,
      created_at: now,
      updated_at: now,
    }

    const ref = getPreferencesRef(workspaceId, user.uid)
    await setDoc(ref, defaults, { merge: true })

    return defaults
  },

  async updatePreferences(
    workspaceId: string,
    changes: Partial<UserPreferences>,
  ): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to update preferences')
    }

    const ref = getPreferencesRef(workspaceId, user.uid)
    await updateDoc(ref, {
      ...changes,
      updated_at: generateTimestamp(),
    })
  },

  subscribeToPreferences(
    workspaceId: string,
    callback: (prefs: UserPreferences | null) => void,
  ): Unsubscribe {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to subscribe to preferences')
    }

    const ref = getPreferencesRef(workspaceId, user.uid)

    return onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as UserPreferences)
      } else {
        callback(null)
      }
    })
  },
}
