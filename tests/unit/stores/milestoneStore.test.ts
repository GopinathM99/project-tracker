import { describe, it, expect, beforeEach } from 'vitest'
import { useMilestoneStore } from '@/stores/milestoneStore'
import type { Milestone } from '@shared/schemas'

const mockMilestone: Milestone = {
  milestone_id: 'ms-1',
  workspace_id: 'ws-1',
  project_id: 'proj-1',
  title: 'Test Milestone',
  description: 'A test milestone',
  status: 'Planned',
  start_date: null,
  target_date: '2026-06-01T00:00:00.000Z',
  completed_at: null,
  owner: null,
  linked_task_ids: [],
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

const mockMilestone2: Milestone = {
  ...mockMilestone,
  milestone_id: 'ms-2',
  title: 'Second Milestone',
}

describe('milestoneStore', () => {
  beforeEach(() => {
    useMilestoneStore.getState().clear()
  })

  it('has correct initial state', () => {
    const state = useMilestoneStore.getState()
    expect(state.milestones).toEqual([])
    expect(state.loading).toBe(false)
  })

  it('setMilestones updates the milestones array', () => {
    useMilestoneStore.getState().setMilestones([mockMilestone, mockMilestone2])
    expect(useMilestoneStore.getState().milestones).toEqual([mockMilestone, mockMilestone2])
  })

  it('updateMilestone updates a milestone in the array', () => {
    useMilestoneStore.getState().setMilestones([mockMilestone, mockMilestone2])
    useMilestoneStore.getState().updateMilestone('ms-1', { title: 'Updated Title' })

    const milestones = useMilestoneStore.getState().milestones
    expect(milestones[0].title).toBe('Updated Title')
    expect(milestones[1].title).toBe('Second Milestone')
  })

  it('updateMilestone does not affect non-matching milestones', () => {
    useMilestoneStore.getState().setMilestones([mockMilestone, mockMilestone2])
    useMilestoneStore.getState().updateMilestone('ms-999', { title: 'Should Not Exist' })

    const milestones = useMilestoneStore.getState().milestones
    expect(milestones[0].title).toBe('Test Milestone')
    expect(milestones[1].title).toBe('Second Milestone')
  })

  it('removeMilestone removes from the array', () => {
    useMilestoneStore.getState().setMilestones([mockMilestone, mockMilestone2])
    useMilestoneStore.getState().removeMilestone('ms-1')

    const milestones = useMilestoneStore.getState().milestones
    expect(milestones).toHaveLength(1)
    expect(milestones[0].milestone_id).toBe('ms-2')
  })

  it('removeMilestone with non-existent id does not change array', () => {
    useMilestoneStore.getState().setMilestones([mockMilestone])
    useMilestoneStore.getState().removeMilestone('ms-999')

    expect(useMilestoneStore.getState().milestones).toHaveLength(1)
  })

  it('setLoading updates loading', () => {
    useMilestoneStore.getState().setLoading(true)
    expect(useMilestoneStore.getState().loading).toBe(true)
  })

  it('clear resets all state', () => {
    useMilestoneStore.getState().setMilestones([mockMilestone])
    useMilestoneStore.getState().setLoading(true)

    useMilestoneStore.getState().clear()

    const state = useMilestoneStore.getState()
    expect(state.milestones).toEqual([])
    expect(state.loading).toBe(false)
  })
})
