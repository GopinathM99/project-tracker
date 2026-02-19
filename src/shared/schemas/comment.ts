import { z } from 'zod'
import { FIELD_LIMITS } from '../constants/validation'

export const commentSchema = z.object({
  comment_id: z.string().min(1),
  workspace_id: z.string().min(1),
  entity_type: z.enum(['Task', 'Bug', 'Project']),
  entity_id: z.string().min(1),
  author_user_id: z.string().min(1),
  content_markdown: z.string().min(1).max(FIELD_LIMITS.COMMENT_BODY_MAX),
  is_edited: z.boolean().default(false),
  edited_at: z.string().datetime().nullable().default(null),
  deleted_at: z.string().datetime().nullable().default(null),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Comment = z.infer<typeof commentSchema>

export const commentCreateSchema = commentSchema.omit({
  comment_id: true,
  is_edited: true,
  edited_at: true,
  deleted_at: true,
  created_at: true,
  updated_at: true,
})

export type CommentCreate = z.infer<typeof commentCreateSchema>
