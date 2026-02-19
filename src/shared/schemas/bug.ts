import { z } from 'zod'
import { FIELD_LIMITS } from '../constants/validation'

export const bugSchema = z
  .object({
    bug_id: z.string().min(1),
    workspace_id: z.string().min(1),
    project_id: z.string().min(1),
    title: z.string().min(1).max(FIELD_LIMITS.TITLE_MAX),
    description: z.string().max(FIELD_LIMITS.DESCRIPTION_MAX).default(''),
    status: z
      .enum(['New', 'Triaged', 'In Progress', 'Fixed', 'Verified', 'Closed', 'Reopened'])
      .default('New'),
    severity: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
    reporter: z.string().min(1),
    assignee: z.string().nullable().default(null),
    environment: z.string().max(FIELD_LIMITS.DESCRIPTION_MAX).default(''),
    steps_to_reproduce: z.string().max(FIELD_LIMITS.DESCRIPTION_MAX).default(''),
    expected_result: z.string().max(FIELD_LIMITS.DESCRIPTION_MAX).default(''),
    actual_result: z.string().max(FIELD_LIMITS.DESCRIPTION_MAX).default(''),
    reported_at: z.string().datetime(),
    target_fix_date: z.string().datetime().nullable().default(null),
    resolved_at: z.string().datetime().nullable().default(null),
    tag_ids: z.array(z.string()).max(FIELD_LIMITS.TAGS_PER_ENTITY).default([]),
    deleted_at: z.string().datetime().nullable().default(null),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
  })
  .refine((data) => !data.target_fix_date || data.target_fix_date >= data.reported_at, {
    message: 'target_fix_date must be on or after reported_at (FR-087)',
    path: ['target_fix_date'],
  })

export type Bug = z.infer<typeof bugSchema>

export const bugCreateSchema = bugSchema.innerType().omit({
  bug_id: true,
  resolved_at: true,
  deleted_at: true,
  created_at: true,
  updated_at: true,
})

export type BugCreate = z.infer<typeof bugCreateSchema>
