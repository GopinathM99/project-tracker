import { z } from 'zod'
import { FIELD_LIMITS } from '../constants/validation'

export const projectSchema = z
  .object({
    project_id: z.string().min(1),
    workspace_id: z.string().min(1),
    folder_id: z.string().nullable().default(null),
    name: z.string().min(1).max(FIELD_LIMITS.TITLE_MAX),
    description: z.string().max(FIELD_LIMITS.DESCRIPTION_MAX).default(''),
    status: z.enum(['Active', 'On Hold', 'Completed', 'Archived']).default('Active'),
    owner: z.string().min(1),
    start_date: z.string().datetime(),
    target_end_date: z.string().datetime(),
    tag_ids: z.array(z.string()).max(FIELD_LIMITS.TAGS_PER_ENTITY).default([]),
    deleted_at: z.string().datetime().nullable().default(null),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
  })
  .refine((data) => data.target_end_date >= data.start_date, {
    message: 'target_end_date must be on or after start_date (FR-106)',
    path: ['target_end_date'],
  })

export type Project = z.infer<typeof projectSchema>

export const projectCreateSchema = projectSchema.innerType().omit({
  project_id: true,
  deleted_at: true,
  created_at: true,
  updated_at: true,
})

export type ProjectCreate = z.infer<typeof projectCreateSchema>
