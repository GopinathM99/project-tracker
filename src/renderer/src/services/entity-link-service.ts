import { db } from '@/lib/firestore'
import { auth } from '@/lib/auth'
import { generateId, generateTimestamp } from '@shared/utils'
import { FIELD_LIMITS } from '@shared/constants/validation'
import type { EntityLink } from '@shared/schemas'
import {
  doc,
  collection,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'

export const entityLinkService = {
  async createLink(
    workspaceId: string,
    data: {
      from_entity_type: 'Task' | 'Bug'
      from_entity_id: string
      to_entity_type: 'Task' | 'Bug'
      to_entity_id: string
      relation_label: string
      is_bidirectional: boolean
    },
  ): Promise<EntityLink> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to create an entity link')
    }

    // Check link count for the source entity
    const existingLinks = await this.getEntityLinks(
      workspaceId,
      data.from_entity_type,
      data.from_entity_id,
    )
    if (existingLinks.length >= FIELD_LIMITS.ENTITY_LINKS_MAX) {
      throw new Error(
        `Maximum of ${FIELD_LIMITS.ENTITY_LINKS_MAX} links per entity has been reached`,
      )
    }

    // Also check link count for the target entity if bidirectional
    if (data.is_bidirectional) {
      const targetLinks = await this.getEntityLinks(
        workspaceId,
        data.to_entity_type,
        data.to_entity_id,
      )
      if (targetLinks.length >= FIELD_LIMITS.ENTITY_LINKS_MAX) {
        throw new Error(
          `Maximum of ${FIELD_LIMITS.ENTITY_LINKS_MAX} links per target entity has been reached`,
        )
      }
    }

    const linkId = generateId()
    const now = generateTimestamp()

    const entityLink: EntityLink = {
      link_id: linkId,
      workspace_id: workspaceId,
      from_entity_type: data.from_entity_type,
      from_entity_id: data.from_entity_id,
      to_entity_type: data.to_entity_type,
      to_entity_id: data.to_entity_id,
      relation_label: data.relation_label,
      is_bidirectional: data.is_bidirectional,
      created_by: user.uid,
      created_at: now,
      updated_at: now,
    }

    const linkRef = doc(db, 'workspaces', workspaceId, 'entity_links', linkId)
    await setDoc(linkRef, entityLink)

    return entityLink
  },

  async getEntityLinks(
    workspaceId: string,
    entityType: 'Task' | 'Bug',
    entityId: string,
  ): Promise<EntityLink[]> {
    // Query 1: Links where this entity is the source
    const fromQuery = query(
      collection(db, 'workspaces', workspaceId, 'entity_links'),
      where('from_entity_type', '==', entityType),
      where('from_entity_id', '==', entityId),
    )

    // Query 2: Links where this entity is the target (for bidirectional links)
    const toQuery = query(
      collection(db, 'workspaces', workspaceId, 'entity_links'),
      where('to_entity_type', '==', entityType),
      where('to_entity_id', '==', entityId),
    )

    const [fromSnapshot, toSnapshot] = await Promise.all([
      getDocs(fromQuery),
      getDocs(toQuery),
    ])

    const fromLinks = fromSnapshot.docs.map((d) => d.data() as EntityLink)
    const toLinks = toSnapshot.docs
      .map((d) => d.data() as EntityLink)
      .filter((link) => link.is_bidirectional)

    // Deduplicate by link_id
    const linkMap = new Map<string, EntityLink>()
    for (const link of [...fromLinks, ...toLinks]) {
      linkMap.set(link.link_id, link)
    }

    return Array.from(linkMap.values())
  },

  async deleteLink(workspaceId: string, linkId: string): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to delete an entity link')
    }

    const linkRef = doc(db, 'workspaces', workspaceId, 'entity_links', linkId)
    await deleteDoc(linkRef)
  },

  subscribeToEntityLinks(
    workspaceId: string,
    entityType: 'Task' | 'Bug',
    entityId: string,
    callback: (links: EntityLink[]) => void,
  ): Unsubscribe {
    // We need two queries for bidirectional support.
    // We maintain local state and combine results from both listeners.
    let fromLinks: EntityLink[] = []
    let toLinks: EntityLink[] = []

    function emitCombined(): void {
      const linkMap = new Map<string, EntityLink>()
      for (const link of [...fromLinks, ...toLinks]) {
        linkMap.set(link.link_id, link)
      }
      callback(Array.from(linkMap.values()))
    }

    const fromQuery = query(
      collection(db, 'workspaces', workspaceId, 'entity_links'),
      where('from_entity_type', '==', entityType),
      where('from_entity_id', '==', entityId),
    )

    const toQuery = query(
      collection(db, 'workspaces', workspaceId, 'entity_links'),
      where('to_entity_type', '==', entityType),
      where('to_entity_id', '==', entityId),
    )

    const unsubFrom = onSnapshot(fromQuery, (snapshot) => {
      fromLinks = snapshot.docs.map((d) => d.data() as EntityLink)
      emitCombined()
    })

    const unsubTo = onSnapshot(toQuery, (snapshot) => {
      toLinks = snapshot.docs
        .map((d) => d.data() as EntityLink)
        .filter((link) => link.is_bidirectional)
      emitCombined()
    })

    return () => {
      unsubFrom()
      unsubTo()
    }
  },
}
