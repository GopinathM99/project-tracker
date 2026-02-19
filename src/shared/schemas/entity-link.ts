import { z } from 'zod'

export const entityLinkSchema = z.object({
  link_id: z.string().min(1),
  workspace_id: z.string().min(1),
  from_entity_type: z.enum(['Task', 'Bug']),
  from_entity_id: z.string().min(1),
  to_entity_type: z.enum(['Task', 'Bug']),
  to_entity_id: z.string().min(1),
  relation_label: z.string().min(1).max(100),
  is_bidirectional: z.boolean().default(true),
  created_by: z.string().min(1),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type EntityLink = z.infer<typeof entityLinkSchema>

export const entityLinkCreateSchema = entityLinkSchema.omit({
  link_id: true,
  created_at: true,
  updated_at: true,
})

export type EntityLinkCreate = z.infer<typeof entityLinkCreateSchema>
