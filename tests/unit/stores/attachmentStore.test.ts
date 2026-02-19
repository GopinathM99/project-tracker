import { describe, it, expect, beforeEach } from 'vitest'
import { useAttachmentStore } from '@/stores/attachmentStore'
import type { Attachment } from '@shared/schemas'

const mockAttachment: Attachment = {
  attachment_id: 'att-1',
  workspace_id: 'ws-1',
  entity_type: 'Task',
  entity_id: 'task-1',
  file_name: 'screenshot.png',
  mime_type: 'image/png',
  file_size_bytes: 1024,
  storage_provider: 'Local',
  storage_path: '/files/screenshot.png',
  thumbnail_path: null,
  uploaded_by: 'user-1',
  uploaded_at: '2026-01-01T00:00:00.000Z',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

const mockAttachment2: Attachment = {
  ...mockAttachment,
  attachment_id: 'att-2',
  file_name: 'document.pdf',
  mime_type: 'application/pdf',
}

describe('attachmentStore', () => {
  beforeEach(() => {
    useAttachmentStore.getState().clear()
  })

  it('has correct initial state', () => {
    const state = useAttachmentStore.getState()
    expect(state.attachments).toEqual([])
    expect(state.loading).toBe(false)
  })

  it('setAttachments updates the attachments array', () => {
    useAttachmentStore.getState().setAttachments([mockAttachment, mockAttachment2])
    expect(useAttachmentStore.getState().attachments).toEqual([mockAttachment, mockAttachment2])
  })

  it('addAttachment appends an attachment to the array', () => {
    useAttachmentStore.getState().setAttachments([mockAttachment])
    useAttachmentStore.getState().addAttachment(mockAttachment2)

    const attachments = useAttachmentStore.getState().attachments
    expect(attachments).toHaveLength(2)
    expect(attachments[0].attachment_id).toBe('att-1')
    expect(attachments[1].attachment_id).toBe('att-2')
  })

  it('addAttachment to empty array', () => {
    useAttachmentStore.getState().addAttachment(mockAttachment)

    const attachments = useAttachmentStore.getState().attachments
    expect(attachments).toHaveLength(1)
    expect(attachments[0]).toEqual(mockAttachment)
  })

  it('removeAttachment removes from the array', () => {
    useAttachmentStore.getState().setAttachments([mockAttachment, mockAttachment2])
    useAttachmentStore.getState().removeAttachment('att-1')

    const attachments = useAttachmentStore.getState().attachments
    expect(attachments).toHaveLength(1)
    expect(attachments[0].attachment_id).toBe('att-2')
  })

  it('removeAttachment with non-existent id does not change array', () => {
    useAttachmentStore.getState().setAttachments([mockAttachment])
    useAttachmentStore.getState().removeAttachment('att-999')

    expect(useAttachmentStore.getState().attachments).toHaveLength(1)
  })

  it('setLoading updates loading', () => {
    useAttachmentStore.getState().setLoading(true)
    expect(useAttachmentStore.getState().loading).toBe(true)
  })

  it('clear resets all state', () => {
    useAttachmentStore.getState().setAttachments([mockAttachment])
    useAttachmentStore.getState().setLoading(true)

    useAttachmentStore.getState().clear()

    const state = useAttachmentStore.getState()
    expect(state.attachments).toEqual([])
    expect(state.loading).toBe(false)
  })
})
