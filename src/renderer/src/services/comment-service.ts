import { db } from '@/lib/firestore'
import { auth } from '@/lib/auth'
import { generateId, generateTimestamp } from '@shared/utils'
import { activityLogger } from '@/services/activity-logger'
import type { Comment } from '@shared/schemas'
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

export const commentService = {
  async createComment(
    workspaceId: string,
    entityType: 'Task' | 'Bug' | 'Project',
    entityId: string,
    content: string,
  ): Promise<Comment> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to create a comment')
    }

    const commentId = generateId()
    const now = generateTimestamp()

    const comment: Comment = {
      comment_id: commentId,
      workspace_id: workspaceId,
      entity_type: entityType,
      entity_id: entityId,
      author_user_id: user.uid,
      content_markdown: content,
      is_edited: false,
      edited_at: null,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    }

    const commentRef = doc(db, 'workspaces', workspaceId, 'comments', commentId)
    await setDoc(commentRef, comment)

    void activityLogger
      .logCommentAdded(workspaceId, entityType, entityId, entityType, {
        comment_id: commentId,
        content_markdown: content,
      })
      .catch(() => {})

    return comment
  },

  async getEntityComments(
    workspaceId: string,
    entityType: string,
    entityId: string,
  ): Promise<Comment[]> {
    const commentsQuery = query(
      collection(db, 'workspaces', workspaceId, 'comments'),
      where('entity_type', '==', entityType),
      where('entity_id', '==', entityId),
      where('deleted_at', '==', null),
    )

    const snapshots = await getDocs(commentsQuery)
    return snapshots.docs.map((d) => d.data() as Comment)
  },

  async updateComment(
    workspaceId: string,
    commentId: string,
    content: string,
  ): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to update a comment')
    }

    // Verify the user is the author
    const commentRef = doc(db, 'workspaces', workspaceId, 'comments', commentId)
    const snapshot = await getDoc(commentRef)

    if (!snapshot.exists()) {
      throw new Error('Comment not found')
    }

    const comment = snapshot.data() as Comment
    if (comment.author_user_id !== user.uid) {
      throw new Error('Only the comment author can edit this comment')
    }

    const now = generateTimestamp()
    await updateDoc(commentRef, {
      content_markdown: content,
      is_edited: true,
      edited_at: now,
      updated_at: now,
    })
  },

  async deleteComment(workspaceId: string, commentId: string): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to delete a comment')
    }

    const commentRef = doc(db, 'workspaces', workspaceId, 'comments', commentId)
    const now = generateTimestamp()
    await updateDoc(commentRef, {
      deleted_at: now,
      updated_at: now,
    })
  },

  subscribeToEntityComments(
    workspaceId: string,
    entityType: string,
    entityId: string,
    callback: (comments: Comment[]) => void,
  ): Unsubscribe {
    const commentsQuery = query(
      collection(db, 'workspaces', workspaceId, 'comments'),
      where('entity_type', '==', entityType),
      where('entity_id', '==', entityId),
      where('deleted_at', '==', null),
    )

    return onSnapshot(commentsQuery, (snapshot) => {
      const comments = snapshot.docs.map((d) => d.data() as Comment)
      callback(comments)
    })
  },
}
