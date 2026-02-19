import { describe, it, expect, beforeEach } from 'vitest'
import { useCommentStore } from '@/stores/commentStore'
import type { Comment } from '@shared/schemas'

const mockComment: Comment = {
  comment_id: 'comment-1',
  workspace_id: 'ws-1',
  entity_type: 'Task',
  entity_id: 'task-1',
  author_user_id: 'user-1',
  content_markdown: 'This is a test comment',
  is_edited: false,
  edited_at: null,
  deleted_at: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

const mockComment2: Comment = {
  ...mockComment,
  comment_id: 'comment-2',
  content_markdown: 'Second comment',
}

describe('commentStore', () => {
  beforeEach(() => {
    useCommentStore.getState().clear()
  })

  it('has correct initial state', () => {
    const state = useCommentStore.getState()
    expect(state.comments).toEqual([])
    expect(state.loading).toBe(false)
  })

  it('setComments updates the comments array', () => {
    useCommentStore.getState().setComments([mockComment, mockComment2])
    expect(useCommentStore.getState().comments).toEqual([mockComment, mockComment2])
  })

  it('addComment appends a comment to the array', () => {
    useCommentStore.getState().setComments([mockComment])
    useCommentStore.getState().addComment(mockComment2)

    const comments = useCommentStore.getState().comments
    expect(comments).toHaveLength(2)
    expect(comments[0].comment_id).toBe('comment-1')
    expect(comments[1].comment_id).toBe('comment-2')
  })

  it('addComment to empty array', () => {
    useCommentStore.getState().addComment(mockComment)

    const comments = useCommentStore.getState().comments
    expect(comments).toHaveLength(1)
    expect(comments[0]).toEqual(mockComment)
  })

  it('updateComment updates a comment in the array', () => {
    useCommentStore.getState().setComments([mockComment, mockComment2])
    useCommentStore.getState().updateComment('comment-1', { content_markdown: 'Updated content' })

    const comments = useCommentStore.getState().comments
    expect(comments[0].content_markdown).toBe('Updated content')
    expect(comments[1].content_markdown).toBe('Second comment')
  })

  it('updateComment does not affect non-matching comments', () => {
    useCommentStore.getState().setComments([mockComment])
    useCommentStore.getState().updateComment('comment-999', { content_markdown: 'Should not apply' })

    expect(useCommentStore.getState().comments[0].content_markdown).toBe('This is a test comment')
  })

  it('removeComment removes from the array', () => {
    useCommentStore.getState().setComments([mockComment, mockComment2])
    useCommentStore.getState().removeComment('comment-1')

    const comments = useCommentStore.getState().comments
    expect(comments).toHaveLength(1)
    expect(comments[0].comment_id).toBe('comment-2')
  })

  it('removeComment with non-existent id does not change array', () => {
    useCommentStore.getState().setComments([mockComment])
    useCommentStore.getState().removeComment('comment-999')

    expect(useCommentStore.getState().comments).toHaveLength(1)
  })

  it('setLoading updates loading', () => {
    useCommentStore.getState().setLoading(true)
    expect(useCommentStore.getState().loading).toBe(true)
  })

  it('clear resets all state', () => {
    useCommentStore.getState().setComments([mockComment])
    useCommentStore.getState().setLoading(true)

    useCommentStore.getState().clear()

    const state = useCommentStore.getState()
    expect(state.comments).toEqual([])
    expect(state.loading).toBe(false)
  })
})
