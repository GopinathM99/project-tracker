import { create } from 'zustand'
import type { Attachment } from '@shared/schemas'

interface AttachmentState {
  attachments: Attachment[]
  loading: boolean
  setAttachments: (attachments: Attachment[]) => void
  addAttachment: (attachment: Attachment) => void
  removeAttachment: (attachmentId: string) => void
  setLoading: (loading: boolean) => void
  clear: () => void
}

export const useAttachmentStore = create<AttachmentState>((set) => ({
  attachments: [],
  loading: false,
  setAttachments: (attachments) => set({ attachments }),
  addAttachment: (attachment) =>
    set((state) => ({ attachments: [...state.attachments, attachment] })),
  removeAttachment: (attachmentId) =>
    set((state) => ({
      attachments: state.attachments.filter(
        (a) => a.attachment_id !== attachmentId,
      ),
    })),
  setLoading: (loading) => set({ loading }),
  clear: () => set({ attachments: [], loading: false }),
}))
