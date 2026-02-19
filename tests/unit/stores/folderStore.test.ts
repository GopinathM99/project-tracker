import { describe, it, expect, beforeEach } from 'vitest'
import { useFolderStore } from '@/stores/folderStore'
import type { Folder } from '@shared/schemas'

const mockFolder: Folder = {
  folder_id: 'folder-1',
  workspace_id: 'ws-1',
  name: 'Test Folder',
  parent_folder_id: null,
  sort_order: 0,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

const mockFolder2: Folder = {
  ...mockFolder,
  folder_id: 'folder-2',
  name: 'Second Folder',
  sort_order: 1,
}

describe('folderStore', () => {
  beforeEach(() => {
    useFolderStore.getState().clear()
  })

  it('has correct initial state', () => {
    const state = useFolderStore.getState()
    expect(state.folders).toEqual([])
    expect(state.loading).toBe(false)
    expect(state.collapsedFolderIds.size).toBe(0)
  })

  it('setFolders updates the folders array', () => {
    useFolderStore.getState().setFolders([mockFolder, mockFolder2])
    expect(useFolderStore.getState().folders).toEqual([mockFolder, mockFolder2])
  })

  it('toggleCollapsed adds a folder id to collapsed set', () => {
    useFolderStore.getState().toggleCollapsed('folder-1')
    expect(useFolderStore.getState().collapsedFolderIds.has('folder-1')).toBe(true)
  })

  it('toggleCollapsed removes a folder id if already collapsed', () => {
    useFolderStore.getState().toggleCollapsed('folder-1')
    useFolderStore.getState().toggleCollapsed('folder-1')
    expect(useFolderStore.getState().collapsedFolderIds.has('folder-1')).toBe(false)
  })

  it('toggleCollapsed handles multiple folders independently', () => {
    useFolderStore.getState().toggleCollapsed('folder-1')
    useFolderStore.getState().toggleCollapsed('folder-2')

    expect(useFolderStore.getState().collapsedFolderIds.has('folder-1')).toBe(true)
    expect(useFolderStore.getState().collapsedFolderIds.has('folder-2')).toBe(true)

    useFolderStore.getState().toggleCollapsed('folder-1')
    expect(useFolderStore.getState().collapsedFolderIds.has('folder-1')).toBe(false)
    expect(useFolderStore.getState().collapsedFolderIds.has('folder-2')).toBe(true)
  })

  it('isCollapsed returns true for collapsed folders', () => {
    useFolderStore.getState().toggleCollapsed('folder-1')
    expect(useFolderStore.getState().isCollapsed('folder-1')).toBe(true)
  })

  it('isCollapsed returns false for non-collapsed folders', () => {
    expect(useFolderStore.getState().isCollapsed('folder-1')).toBe(false)
  })

  it('setLoading updates loading', () => {
    useFolderStore.getState().setLoading(true)
    expect(useFolderStore.getState().loading).toBe(true)
  })

  it('clear resets all state', () => {
    useFolderStore.getState().setFolders([mockFolder])
    useFolderStore.getState().setLoading(true)
    useFolderStore.getState().toggleCollapsed('folder-1')

    useFolderStore.getState().clear()

    const state = useFolderStore.getState()
    expect(state.folders).toEqual([])
    expect(state.loading).toBe(false)
    expect(state.collapsedFolderIds.size).toBe(0)
  })
})
