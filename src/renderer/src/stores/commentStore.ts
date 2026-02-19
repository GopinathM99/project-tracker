import { create } from 'zustand'
import type { Comment } from '@shared/schemas'

interface CommentState {
  comments: Comment[]
  loading: boolean
  setComments: (comments: Comment[]) => void
  addComment: (comment: Comment) => void
  updateComment: (commentId: string, changes: Partial<Comment>) => void
  removeComment: (commentId: string) => void
  setLoading: (loading: boolean) => void
  clear: () => void
}

export const useCommentStore = create<CommentState>((set) => ({
  comments: [],
  loading: false,
  setComments: (comments) => set({ comments }),
  addComment: (comment) =>
    set((state) => ({ comments: [...state.comments, comment] })),
  updateComment: (commentId, changes) =>
    set((state) => ({
      comments: state.comments.map((c) =>
        c.comment_id === commentId ? { ...c, ...changes } : c,
      ),
    })),
  removeComment: (commentId) =>
    set((state) => ({
      comments: state.comments.filter((c) => c.comment_id !== commentId),
    })),
  setLoading: (loading) => set({ loading }),
  clear: () => set({ comments: [], loading: false }),
}))
