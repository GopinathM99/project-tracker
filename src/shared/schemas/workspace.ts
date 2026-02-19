import { z } from 'zod'
import { FIELD_LIMITS } from '../constants/validation'

export const workspaceSchema = z.object({
  workspace_id: z.string().min(1),
  name: z.string().min(1).max(FIELD_LIMITS.TITLE_MAX),
  slug: z.string().min(1).max(100),
  owner_user_id: z.string().min(1),
  plan_tier: z.enum(['Free', 'Pro']).nullable().default(null),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Workspace = z.infer<typeof workspaceSchema>

export const workspaceCreateSchema = workspaceSchema.omit({
  workspace_id: true,
  created_at: true,
  updated_at: true,
})

export type WorkspaceCreate = z.infer<typeof workspaceCreateSchema>
