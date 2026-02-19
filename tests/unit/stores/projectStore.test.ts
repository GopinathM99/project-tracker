import { describe, it, expect, beforeEach } from 'vitest'
import { useProjectStore } from '@/stores/projectStore'
import type { Project } from '@shared/schemas'

const mockProject: Project = {
  project_id: 'proj-1',
  workspace_id: 'ws-1',
  folder_id: null,
  name: 'Test Project',
  description: 'A test project',
  status: 'Active',
  owner: 'user-1',
  start_date: '2026-01-01T00:00:00.000Z',
  target_end_date: '2026-06-01T00:00:00.000Z',
  tag_ids: [],
  deleted_at: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

const mockProject2: Project = {
  ...mockProject,
  project_id: 'proj-2',
  name: 'Second Project',
}

describe('projectStore', () => {
  beforeEach(() => {
    useProjectStore.getState().clear()
  })

  it('has correct initial state', () => {
    const state = useProjectStore.getState()
    expect(state.projects).toEqual([])
    expect(state.currentProject).toBeNull()
    expect(state.loading).toBe(false)
  })

  it('setProjects updates the projects array', () => {
    useProjectStore.getState().setProjects([mockProject, mockProject2])
    expect(useProjectStore.getState().projects).toEqual([mockProject, mockProject2])
  })

  it('setCurrentProject updates currentProject', () => {
    useProjectStore.getState().setCurrentProject(mockProject)
    expect(useProjectStore.getState().currentProject).toEqual(mockProject)
  })

  it('setCurrentProject to null clears currentProject', () => {
    useProjectStore.getState().setCurrentProject(mockProject)
    useProjectStore.getState().setCurrentProject(null)
    expect(useProjectStore.getState().currentProject).toBeNull()
  })

  it('updateProject updates a project in the array', () => {
    useProjectStore.getState().setProjects([mockProject, mockProject2])
    useProjectStore.getState().updateProject('proj-1', { name: 'Updated Name' })

    const projects = useProjectStore.getState().projects
    expect(projects[0].name).toBe('Updated Name')
    expect(projects[1].name).toBe('Second Project')
  })

  it('updateProject also updates currentProject if it matches', () => {
    useProjectStore.getState().setProjects([mockProject])
    useProjectStore.getState().setCurrentProject(mockProject)
    useProjectStore.getState().updateProject('proj-1', { name: 'Updated Name' })

    expect(useProjectStore.getState().currentProject?.name).toBe('Updated Name')
  })

  it('updateProject does not affect currentProject if it does not match', () => {
    useProjectStore.getState().setProjects([mockProject, mockProject2])
    useProjectStore.getState().setCurrentProject(mockProject)
    useProjectStore.getState().updateProject('proj-2', { name: 'Updated Second' })

    expect(useProjectStore.getState().currentProject?.name).toBe('Test Project')
  })

  it('removeProject removes from the array', () => {
    useProjectStore.getState().setProjects([mockProject, mockProject2])
    useProjectStore.getState().removeProject('proj-1')

    const projects = useProjectStore.getState().projects
    expect(projects).toHaveLength(1)
    expect(projects[0].project_id).toBe('proj-2')
  })

  it('removeProject clears currentProject if it matches', () => {
    useProjectStore.getState().setProjects([mockProject, mockProject2])
    useProjectStore.getState().setCurrentProject(mockProject)
    useProjectStore.getState().removeProject('proj-1')

    expect(useProjectStore.getState().currentProject).toBeNull()
  })

  it('removeProject does not affect currentProject if it does not match', () => {
    useProjectStore.getState().setProjects([mockProject, mockProject2])
    useProjectStore.getState().setCurrentProject(mockProject)
    useProjectStore.getState().removeProject('proj-2')

    expect(useProjectStore.getState().currentProject).toEqual(mockProject)
  })

  it('setLoading updates loading', () => {
    useProjectStore.getState().setLoading(true)
    expect(useProjectStore.getState().loading).toBe(true)
  })

  it('clear resets all state', () => {
    useProjectStore.getState().setProjects([mockProject])
    useProjectStore.getState().setCurrentProject(mockProject)
    useProjectStore.getState().setLoading(true)

    useProjectStore.getState().clear()

    const state = useProjectStore.getState()
    expect(state.projects).toEqual([])
    expect(state.currentProject).toBeNull()
    expect(state.loading).toBe(false)
  })
})
