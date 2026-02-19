import { z } from 'zod'

export const dependencyLinkSchema = z.object({
  dependency_id: z.string().min(1),
  workspace_id: z.string().min(1),
  from_task_id: z.string().min(1),
  to_task_id: z.string().min(1),
  relation_type: z.enum(['Finish-to-Start']).default('Finish-to-Start'),
  is_cross_project: z.literal(false).default(false),
  created_by: z.string().min(1),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type DependencyLink = z.infer<typeof dependencyLinkSchema>

export const dependencyLinkCreateSchema = dependencyLinkSchema.omit({
  dependency_id: true,
  created_at: true,
  updated_at: true,
})

export type DependencyLinkCreate = z.infer<typeof dependencyLinkCreateSchema>
