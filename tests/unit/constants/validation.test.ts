import { describe, it, expect } from 'vitest'
import { FIELD_LIMITS } from '@shared/constants/validation'

describe('FIELD_LIMITS', () => {
  it('has correct title max', () => {
    expect(FIELD_LIMITS.TITLE_MAX).toBe(200)
  })

  it('has correct description max', () => {
    expect(FIELD_LIMITS.DESCRIPTION_MAX).toBe(20_000)
  })

  it('has correct comment body max', () => {
    expect(FIELD_LIMITS.COMMENT_BODY_MAX).toBe(5_000)
  })

  it('has correct attachments per entity', () => {
    expect(FIELD_LIMITS.ATTACHMENTS_PER_ENTITY).toBe(20)
  })

  it('has correct tags per entity', () => {
    expect(FIELD_LIMITS.TAGS_PER_ENTITY).toBe(15)
  })

  it('has correct bulk action max', () => {
    expect(FIELD_LIMITS.BULK_ACTION_MAX).toBe(200)
  })

  it('has correct subtask depth max', () => {
    expect(FIELD_LIMITS.SUBTASK_DEPTH_MAX).toBe(5)
  })

  it('has correct folder depth max', () => {
    expect(FIELD_LIMITS.FOLDER_DEPTH_MAX).toBe(3)
  })

  it('has correct entity links max', () => {
    expect(FIELD_LIMITS.ENTITY_LINKS_MAX).toBe(20)
  })

  it('has correct undo history size', () => {
    expect(FIELD_LIMITS.UNDO_HISTORY_SIZE).toBe(50)
  })

  it('has correct trash purge days', () => {
    expect(FIELD_LIMITS.TRASH_PURGE_DAYS).toBe(30)
  })
})
