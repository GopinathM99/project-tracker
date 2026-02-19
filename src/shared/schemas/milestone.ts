import { z } from 'zod'
import { FIELD_LIMITS } from '../constants/validation'

export const milestoneSchema = z.object({
  milestone_id: z.string().min(1),
  workspace_id: z.string().min(1),
  project_id: z.string().min(1),
  title: z.string().min(1).max(FIELD_LIMITS.TITLE_MAX),
  description: z.string().max(FIELD_LIMITS.DESCRIPTION_MAX).default(''),
  status: z.enum(['Planned', 'In Progress', 'Completed', 'Delayed']).default('Planned'),
  start_date: z.string().datetime().nullable().default(null),
  target_date: z.string().datetime(),
  completed_at: z.string().datetime().nullable().default(null),
  owner: z.string().nullable().default(null),
  linked_task_ids: z.array(z.string()).default([]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Milestone = z.infer<typeof milestoneSchema>

export const milestoneCreateSchema = milestoneSchema.omit({
  milestone_id: true,
  completed_at: true,
  created_at: true,
  updated_at: true,
})

export type MilestoneCreate = z.infer<typeof milestoneCreateSchema>
