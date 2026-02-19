import { z } from 'zod'

export const notificationSchema = z.object({
  notification_id: z.string().min(1),
  workspace_id: z.string().min(1),
  recipient_user_id: z.string().min(1),
  trigger_type: z.enum([
    'Reminder',
    'Overdue',
    'Assignment',
    'Comment',
    'Invite',
    'StatusChange',
    'PriorityChange',
  ]),
  entity_type: z.enum(['Workspace', 'Project', 'Task', 'Bug', 'Milestone', 'Comment']),
  entity_id: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  is_read: z.boolean().default(false),
  delivered_os: z.boolean().default(false),
  created_at: z.string().datetime(),
  read_at: z.string().datetime().nullable().default(null),
})

export type Notification = z.infer<typeof notificationSchema>

export const notificationCreateSchema = notificationSchema.omit({
  notification_id: true,
  is_read: true,
  delivered_os: true,
  created_at: true,
  read_at: true,
})

export type NotificationCreate = z.infer<typeof notificationCreateSchema>
