import { z } from 'zod'

export const activityEventSchema = z.object({
  event_id: z.string().min(1),
  workspace_id: z.string().min(1),
  actor_user_id: z.string().min(1),
  entity_type: z.enum(['Workspace', 'Project', 'Task', 'Bug', 'Milestone', 'Comment']),
  entity_id: z.string().min(1),
  action: z.enum([
    'Created',
    'Updated',
    'Deleted',
    'Restored',
    'StatusChanged',
    'Assigned',
    'Commented',
    'Linked',
    'Unlinked',
    'Archived',
    'Unarchived',
  ]),
  change_summary: z.string().min(1),
  metadata: z.record(z.unknown()).nullable().default(null),
  created_at: z.string().datetime(),
})

export type ActivityEvent = z.infer<typeof activityEventSchema>

export const activityEventCreateSchema = activityEventSchema.omit({
  event_id: true,
  created_at: true,
})

export type ActivityEventCreate = z.infer<typeof activityEventCreateSchema>
