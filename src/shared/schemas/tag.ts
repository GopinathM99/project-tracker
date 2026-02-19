import { z } from 'zod'
import { FIELD_LIMITS } from '../constants/validation'

export const tagSchema = z.object({
  tag_id: z.string().min(1),
  workspace_id: z.string().min(1),
  name: z.string().min(1).max(FIELD_LIMITS.TITLE_MAX),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color'),
  scope: z.enum(['Global', 'Project']),
  project_id: z.string().nullable().default(null),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Tag = z.infer<typeof tagSchema>

export const tagCreateSchema = tagSchema.omit({
  tag_id: true,
  created_at: true,
  updated_at: true,
})

export type TagCreate = z.infer<typeof tagCreateSchema>
