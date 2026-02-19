import { z } from 'zod'

export const attachmentSchema = z.object({
  attachment_id: z.string().min(1),
  workspace_id: z.string().min(1),
  entity_type: z.enum(['Task', 'Bug', 'Project', 'Comment']),
  entity_id: z.string().min(1),
  file_name: z.string().min(1),
  mime_type: z.string().min(1),
  file_size_bytes: z.number().int().positive(),
  storage_provider: z.enum(['Local', 'FirebaseStorage']),
  storage_path: z.string().min(1),
  thumbnail_path: z.string().nullable().default(null),
  uploaded_by: z.string().min(1),
  uploaded_at: z.string().datetime(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Attachment = z.infer<typeof attachmentSchema>

export const attachmentCreateSchema = attachmentSchema.omit({
  attachment_id: true,
  created_at: true,
  updated_at: true,
})

export type AttachmentCreate = z.infer<typeof attachmentCreateSchema>
