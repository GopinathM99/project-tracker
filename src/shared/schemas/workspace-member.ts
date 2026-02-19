import { z } from 'zod'

export const workspaceMemberSchema = z.object({
  membership_id: z.string().min(1),
  workspace_id: z.string().min(1),
  user_id: z.string().min(1),
  role: z.enum(['Owner', 'Member', 'Viewer']),
  status: z.enum(['Active', 'Suspended', 'Removed']),
  invited_by: z.string().nullable().default(null),
  invited_at: z.string().datetime().nullable().default(null),
  accepted_at: z.string().datetime().nullable().default(null),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type WorkspaceMember = z.infer<typeof workspaceMemberSchema>

export const workspaceMemberCreateSchema = workspaceMemberSchema.omit({
  membership_id: true,
  created_at: true,
  updated_at: true,
})

export type WorkspaceMemberCreate = z.infer<typeof workspaceMemberCreateSchema>
