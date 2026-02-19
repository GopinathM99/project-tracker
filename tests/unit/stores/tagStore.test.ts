import { describe, it, expect, beforeEach } from 'vitest'
import { useTagStore } from '@/stores/tagStore'
import type { Tag } from '@shared/schemas'

const mockTag: Tag = {
  tag_id: 'tag-1',
  workspace_id: 'ws-1',
  name: 'Bug',
  color: '#ff0000',
  scope: 'Global',
  project_id: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

const mockTag2: Tag = {
  ...mockTag,
  tag_id: 'tag-2',
  name: 'Feature',
  color: '#00ff00',
}

describe('tagStore', () => {
  beforeEach(() => {
    useTagStore.getState().clear()
  })

  it('has correct initial state', () => {
    const state = useTagStore.getState()
    expect(state.tags).toEqual([])
    expect(state.loading).toBe(false)
  })

  it('setTags updates the tags array', () => {
    useTagStore.getState().setTags([mockTag, mockTag2])
    expect(useTagStore.getState().tags).toEqual([mockTag, mockTag2])
  })

  it('setTags replaces existing tags', () => {
    useTagStore.getState().setTags([mockTag])
    useTagStore.getState().setTags([mockTag2])

    const tags = useTagStore.getState().tags
    expect(tags).toHaveLength(1)
    expect(tags[0].tag_id).toBe('tag-2')
  })

  it('setLoading updates loading', () => {
    useTagStore.getState().setLoading(true)
    expect(useTagStore.getState().loading).toBe(true)
  })

  it('clear resets all state', () => {
    useTagStore.getState().setTags([mockTag])
    useTagStore.getState().setLoading(true)

    useTagStore.getState().clear()

    const state = useTagStore.getState()
    expect(state.tags).toEqual([])
    expect(state.loading).toBe(false)
  })
})
