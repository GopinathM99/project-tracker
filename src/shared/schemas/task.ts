import { z } from 'zod'
import { FIELD_LIMITS } from '../constants/validation'

export const taskSchema = z
  .object({
    task_id: z.string().min(1),
    workspace_id: z.string().min(1),
    project_id: z.string().min(1),
    parent_task_id: z.string().nullable().default(null),
    title: z.string().min(1).max(FIELD_LIMITS.TITLE_MAX),
    description: z.string().max(FIELD_LIMITS.DESCRIPTION_MAX).default(''),
    status: z.enum(['Not Started', 'In Progress', 'Blocked', 'Done']).default('Not Started'),
    start_date: z.string().datetime(),
    expected_completion_date: z.string().datetime(),
    due_date: z.string().datetime().nullable().default(null),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
    owner: z.string().nullable().default(null),
    recurrence_id: z.string().nullable().default(null),
    kanban_sort_order: z.number().nullable().default(null),
    tag_ids: z.array(z.string()).max(FIELD_LIMITS.TAGS_PER_ENTITY).default([]),
    deleted_at: z.string().datetime().nullable().default(null),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
  })
  .refine((data) => data.expected_completion_date >= data.start_date, {
    message: 'expected_completion_date must be on or after start_date (FR-074)',
    path: ['expected_completion_date'],
  })
  .refine((data) => !data.due_date || data.due_date >= data.start_date, {
    message: 'due_date must be on or after start_date (FR-074)',
    path: ['due_date'],
  })

export type Task = z.infer<typeof taskSchema>

export const taskCreateSchema = taskSchema
  .innerType()
  .innerType()
  .omit({
    task_id: true,
    deleted_at: true,
    created_at: true,
    updated_at: true,
  })

export type TaskCreate = z.infer<typeof taskCreateSchema>
