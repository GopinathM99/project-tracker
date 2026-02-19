import { z } from 'zod'
import { FIELD_LIMITS } from '../constants/validation'

export const folderSchema = z.object({
  folder_id: z.string().min(1),
  workspace_id: z.string().min(1),
  name: z.string().min(1).max(FIELD_LIMITS.TITLE_MAX),
  parent_folder_id: z.string().nullable().default(null),
  sort_order: z.number().default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Folder = z.infer<typeof folderSchema>

export const folderCreateSchema = folderSchema.omit({
  folder_id: true,
  created_at: true,
  updated_at: true,
})

export type FolderCreate = z.infer<typeof folderCreateSchema>
