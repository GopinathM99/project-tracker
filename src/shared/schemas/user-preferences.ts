import { z } from 'zod'

export const userPreferencesSchema = z.object({
  user_id: z.string().min(1),
  workspace_id: z.string().min(1),
  theme: z.enum(['System', 'Light', 'Dark']).default('System'),
  default_view: z.enum(['Dashboard', 'Kanban', 'Calendar', 'TaskList']).default('Dashboard'),
  notification_reminders: z.boolean().default(true),
  notification_overdue: z.boolean().default(true),
  notification_assignments: z.boolean().default(true),
  notification_comments: z.boolean().default(true),
  notification_status_changes: z.boolean().default(true),
  sidebar_collapsed: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type UserPreferences = z.infer<typeof userPreferencesSchema>

export const userPreferencesCreateSchema = userPreferencesSchema.omit({
  created_at: true,
  updated_at: true,
})

export type UserPreferencesCreate = z.infer<typeof userPreferencesCreateSchema>
