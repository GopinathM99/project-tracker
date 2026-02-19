import { db } from '@/lib/firestore'
import { auth } from '@/lib/auth'
import { generateId, generateTimestamp } from '@shared/utils'
import type { ActivityEvent } from '@shared/schemas'
import {
  doc,
  collection,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'

export const activityEventService = {
  async logEvent(
    workspaceId: string,
    data: {
      entity_type: ActivityEvent['entity_type']
      entity_id: string
      action: ActivityEvent['action']
      change_summary: string
      metadata?: Record<string, unknown> | null
    },
  ): Promise<ActivityEvent> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to log an activity event')
    }

    const eventId = generateId()
    const now = generateTimestamp()

    const event: ActivityEvent = {
      event_id: eventId,
      workspace_id: workspaceId,
      actor_user_id: user.uid,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      action: data.action,
      change_summary: data.change_summary,
      metadata: data.metadata ?? null,
      created_at: now,
    }

    const eventRef = doc(db, 'workspaces', workspaceId, 'activity_events', eventId)
    await setDoc(eventRef, event)

    return event
  },

  async getEntityEvents(
    workspaceId: string,
    entityType: string,
    entityId: string,
    options?: { limitCount?: number },
  ): Promise<ActivityEvent[]> {
    const eventsQuery = query(
      collection(db, 'workspaces', workspaceId, 'activity_events'),
      where('entity_type', '==', entityType),
      where('entity_id', '==', entityId),
      orderBy('created_at', 'desc'),
      limit(options?.limitCount ?? 50),
    )

    const snapshots = await getDocs(eventsQuery)
    return snapshots.docs.map((d) => d.data() as ActivityEvent)
  },

  async getProjectEvents(
    workspaceId: string,
    projectId: string,
    options?: { limitCount?: number },
  ): Promise<ActivityEvent[]> {
    const maxResults = options?.limitCount ?? 100

    // Query 1: Events where entity is the project itself
    const projectQuery = query(
      collection(db, 'workspaces', workspaceId, 'activity_events'),
      where('entity_type', '==', 'Project'),
      where('entity_id', '==', projectId),
      orderBy('created_at', 'desc'),
      limit(maxResults),
    )

    // Query 2: Events with project_id in metadata (tasks, bugs, etc.)
    const childQuery = query(
      collection(db, 'workspaces', workspaceId, 'activity_events'),
      where('metadata.project_id', '==', projectId),
      orderBy('created_at', 'desc'),
      limit(maxResults),
    )

    const [projectSnapshot, childSnapshot] = await Promise.all([
      getDocs(projectQuery),
      getDocs(childQuery),
    ])

    const projectEvents = projectSnapshot.docs.map((d) => d.data() as ActivityEvent)
    const childEvents = childSnapshot.docs.map((d) => d.data() as ActivityEvent)

    // Deduplicate and sort by created_at desc
    const eventMap = new Map<string, ActivityEvent>()
    for (const event of [...projectEvents, ...childEvents]) {
      eventMap.set(event.event_id, event)
    }

    return Array.from(eventMap.values())
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, maxResults)
  },

  async getWorkspaceEvents(
    workspaceId: string,
    options?: { limitCount?: number; entityTypeFilter?: string; actorFilter?: string },
  ): Promise<ActivityEvent[]> {
    const constraints = [
      orderBy('created_at', 'desc'),
      limit(options?.limitCount ?? 100),
    ]

    if (options?.entityTypeFilter) {
      constraints.unshift(where('entity_type', '==', options.entityTypeFilter))
    }

    if (options?.actorFilter) {
      constraints.unshift(where('actor_user_id', '==', options.actorFilter))
    }

    const eventsQuery = query(
      collection(db, 'workspaces', workspaceId, 'activity_events'),
      ...constraints,
    )

    const snapshots = await getDocs(eventsQuery)
    return snapshots.docs.map((d) => d.data() as ActivityEvent)
  },

  subscribeToEntityEvents(
    workspaceId: string,
    entityType: string,
    entityId: string,
    callback: (events: ActivityEvent[]) => void,
  ): Unsubscribe {
    const eventsQuery = query(
      collection(db, 'workspaces', workspaceId, 'activity_events'),
      where('entity_type', '==', entityType),
      where('entity_id', '==', entityId),
      orderBy('created_at', 'desc'),
      limit(50),
    )

    return onSnapshot(eventsQuery, (snapshot) => {
      const events = snapshot.docs.map((d) => d.data() as ActivityEvent)
      callback(events)
    })
  },
}
