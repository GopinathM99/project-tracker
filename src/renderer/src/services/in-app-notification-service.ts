import { db } from '@/lib/firestore'
import { generateId, generateTimestamp } from '@shared/utils'
import type { Notification as AppNotification } from '@shared/schemas'
import {
  doc,
  collection,
  setDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore'

export const inAppNotificationService = {
  async createNotification(
    workspaceId: string,
    data: {
      recipient_user_id: string
      trigger_type: AppNotification['trigger_type']
      entity_type: AppNotification['entity_type']
      entity_id: string
      title: string
      body: string
    },
  ): Promise<AppNotification> {
    const notificationId = generateId()
    const now = generateTimestamp()

    const notification: AppNotification = {
      notification_id: notificationId,
      workspace_id: workspaceId,
      recipient_user_id: data.recipient_user_id,
      trigger_type: data.trigger_type,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      title: data.title,
      body: data.body,
      is_read: false,
      delivered_os: false,
      created_at: now,
      read_at: null,
    }

    const notificationRef = doc(
      db,
      'workspaces',
      workspaceId,
      'notifications',
      notificationId,
    )
    await setDoc(notificationRef, notification)

    return notification
  },

  async getUserNotifications(
    workspaceId: string,
    userId: string,
    options?: { unreadOnly?: boolean; limitCount?: number },
  ): Promise<AppNotification[]> {
    const constraints = [
      where('recipient_user_id', '==', userId),
      orderBy('created_at', 'desc'),
      limit(options?.limitCount ?? 50),
    ]

    if (options?.unreadOnly) {
      constraints.splice(1, 0, where('is_read', '==', false))
    }

    const notificationsQuery = query(
      collection(db, 'workspaces', workspaceId, 'notifications'),
      ...constraints,
    )

    const snapshots = await getDocs(notificationsQuery)
    return snapshots.docs.map((d) => d.data() as AppNotification)
  },

  async markAsRead(workspaceId: string, notificationId: string): Promise<void> {
    const notificationRef = doc(
      db,
      'workspaces',
      workspaceId,
      'notifications',
      notificationId,
    )
    await updateDoc(notificationRef, {
      is_read: true,
      read_at: generateTimestamp(),
    })
  },

  async markAllAsRead(workspaceId: string, userId: string): Promise<void> {
    const unreadQuery = query(
      collection(db, 'workspaces', workspaceId, 'notifications'),
      where('recipient_user_id', '==', userId),
      where('is_read', '==', false),
    )

    const snapshots = await getDocs(unreadQuery)

    if (snapshots.empty) return

    const batch = writeBatch(db)
    const now = generateTimestamp()

    for (const docSnapshot of snapshots.docs) {
      batch.update(docSnapshot.ref, {
        is_read: true,
        read_at: now,
      })
    }

    await batch.commit()
  },

  async getUnreadCount(workspaceId: string, userId: string): Promise<number> {
    const unreadQuery = query(
      collection(db, 'workspaces', workspaceId, 'notifications'),
      where('recipient_user_id', '==', userId),
      where('is_read', '==', false),
    )

    const snapshots = await getDocs(unreadQuery)
    return snapshots.size
  },

  subscribeToUserNotifications(
    workspaceId: string,
    userId: string,
    callback: (notifications: AppNotification[]) => void,
    options?: { unreadOnly?: boolean },
  ): Unsubscribe {
    const constraints = [
      where('recipient_user_id', '==', userId),
      orderBy('created_at', 'desc'),
      limit(50),
    ]

    if (options?.unreadOnly) {
      constraints.splice(1, 0, where('is_read', '==', false))
    }

    const notificationsQuery = query(
      collection(db, 'workspaces', workspaceId, 'notifications'),
      ...constraints,
    )

    return onSnapshot(notificationsQuery, (snapshot) => {
      const notifications = snapshot.docs.map((d) => d.data() as AppNotification)
      callback(notifications)
    })
  },

  subscribeToUnreadCount(
    workspaceId: string,
    userId: string,
    callback: (count: number) => void,
  ): Unsubscribe {
    const unreadQuery = query(
      collection(db, 'workspaces', workspaceId, 'notifications'),
      where('recipient_user_id', '==', userId),
      where('is_read', '==', false),
    )

    return onSnapshot(unreadQuery, (snapshot) => {
      callback(snapshot.size)
    })
  },
}
