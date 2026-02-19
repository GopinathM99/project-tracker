import { db } from '@/lib/firestore'
import { auth } from '@/lib/auth'
import { generateId, generateTimestamp } from '@shared/utils'
import type { Attachment } from '@shared/schemas'
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

export const attachmentService = {
  async createAttachment(
    workspaceId: string,
    entityType: 'Task' | 'Bug' | 'Project' | 'Comment',
    entityId: string,
    fileInfo: {
      fileName: string
      mimeType: string
      fileSizeBytes: number
      storagePath: string
    },
  ): Promise<Attachment> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to create an attachment')
    }

    const attachmentId = generateId()
    const now = generateTimestamp()

    const attachment: Attachment = {
      attachment_id: attachmentId,
      workspace_id: workspaceId,
      entity_type: entityType,
      entity_id: entityId,
      file_name: fileInfo.fileName,
      mime_type: fileInfo.mimeType,
      file_size_bytes: fileInfo.fileSizeBytes,
      storage_provider: 'Local',
      storage_path: fileInfo.storagePath,
      thumbnail_path: null,
      uploaded_by: user.uid,
      uploaded_at: now,
      created_at: now,
      updated_at: now,
    }

    const attachmentRef = doc(
      db,
      'workspaces',
      workspaceId,
      'attachments',
      attachmentId,
    )
    await setDoc(attachmentRef, attachment)

    return attachment
  },

  async getEntityAttachments(
    workspaceId: string,
    entityType: string,
    entityId: string,
  ): Promise<Attachment[]> {
    const attachmentsQuery = query(
      collection(db, 'workspaces', workspaceId, 'attachments'),
      where('entity_type', '==', entityType),
      where('entity_id', '==', entityId),
    )

    const snapshots = await getDocs(attachmentsQuery)
    return snapshots.docs.map((d) => d.data() as Attachment)
  },

  async removeAttachment(
    workspaceId: string,
    attachmentId: string,
  ): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to remove an attachment')
    }

    const attachmentRef = doc(
      db,
      'workspaces',
      workspaceId,
      'attachments',
      attachmentId,
    )
    await deleteDoc(attachmentRef)
  },

  subscribeToEntityAttachments(
    workspaceId: string,
    entityType: string,
    entityId: string,
    callback: (attachments: Attachment[]) => void,
  ): Unsubscribe {
    const attachmentsQuery = query(
      collection(db, 'workspaces', workspaceId, 'attachments'),
      where('entity_type', '==', entityType),
      where('entity_id', '==', entityId),
    )

    return onSnapshot(attachmentsQuery, (snapshot) => {
      const attachments = snapshot.docs.map((d) => d.data() as Attachment)
      callback(attachments)
    })
  },
}
