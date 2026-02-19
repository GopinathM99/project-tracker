import { z } from 'zod'

export const recurringTaskDefinitionSchema = z.object({
  recurrence_id: z.string().min(1),
  workspace_id: z.string().min(1),
  project_id: z.string().min(1),
  template_task_id: z.string().min(1),
  interval_type: z.enum(['Daily', 'Weekly', 'Monthly', 'Custom']),
  interval_value: z.number().int().positive(),
  days_of_week: z.array(z.number().int().min(0).max(6)).nullable().default(null),
  day_of_month: z.number().int().min(1).max(31).nullable().default(null),
  end_type: z.enum(['Never', 'AfterCount', 'OnDate']),
  end_after_count: z.number().int().positive().nullable().default(null),
  end_on_date: z.string().datetime().nullable().default(null),
  next_generation_date: z.string().datetime(),
  is_active: z.boolean().default(true),
  created_by: z.string().min(1),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type RecurringTaskDefinition = z.infer<typeof recurringTaskDefinitionSchema>

export const recurringTaskDefinitionCreateSchema = recurringTaskDefinitionSchema.omit({
  recurrence_id: true,
  created_at: true,
  updated_at: true,
})

export type RecurringTaskDefinitionCreate = z.infer<typeof recurringTaskDefinitionCreateSchema>
