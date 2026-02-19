import { z } from 'zod'

export const inviteSchema = z.object({
  invite_id: z.string().min(1),
  workspace_id: z.string().min(1),
  invited_email: z.string().email(),
  role: z.enum(['Owner', 'Member', 'Viewer']),
  status: z.enum(['Pending', 'Accepted', 'Expired', 'Revoked']).default('Pending'),
  token_hash: z.string().min(1),
  expires_at: z.string().datetime(),
  invited_by: z.string().min(1),
  accepted_by_user_id: z.string().nullable().default(null),
  accepted_at: z.string().datetime().nullable().default(null),
  revoked_at: z.string().datetime().nullable().default(null),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Invite = z.infer<typeof inviteSchema>

export const inviteCreateSchema = inviteSchema.omit({
  invite_id: true,
  accepted_by_user_id: true,
  accepted_at: true,
  revoked_at: true,
  created_at: true,
  updated_at: true,
})

export type InviteCreate = z.infer<typeof inviteCreateSchema>
