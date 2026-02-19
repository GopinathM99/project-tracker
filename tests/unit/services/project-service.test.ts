import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/firebase', () => ({ app: {} }))
vi.mock('@/lib/firestore', () => ({ db: {} }))
vi.mock('@/lib/auth', () => ({ auth: {} }))

import { projectService } from '@/services/project-service'

describe('projectService', () => {
  it('is exported', () => {
    expect(projectService).toBeDefined()
  })

  it('has createProject method', () => {
    expect(typeof projectService.createProject).toBe('function')
  })

  it('has getProject method', () => {
    expect(typeof projectService.getProject).toBe('function')
  })

  it('has getWorkspaceProjects method', () => {
    expect(typeof projectService.getWorkspaceProjects).toBe('function')
  })

  it('has updateProject method', () => {
    expect(typeof projectService.updateProject).toBe('function')
  })

  it('has archiveProject method', () => {
    expect(typeof projectService.archiveProject).toBe('function')
  })

  it('has unarchiveProject method', () => {
    expect(typeof projectService.unarchiveProject).toBe('function')
  })

  it('has deleteProject method', () => {
    expect(typeof projectService.deleteProject).toBe('function')
  })

  it('has subscribeToProjects method', () => {
    expect(typeof projectService.subscribeToProjects).toBe('function')
  })

  it('has subscribeToProject method', () => {
    expect(typeof projectService.subscribeToProject).toBe('function')
  })
})
