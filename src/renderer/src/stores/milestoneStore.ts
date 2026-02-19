import { create } from 'zustand'
import type { Milestone } from '@shared/schemas'

interface MilestoneState {
  milestones: Milestone[]
  loading: boolean
  setMilestones: (milestones: Milestone[]) => void
  updateMilestone: (milestoneId: string, changes: Partial<Milestone>) => void
  removeMilestone: (milestoneId: string) => void
  setLoading: (loading: boolean) => void
  clear: () => void
}

export const useMilestoneStore = create<MilestoneState>((set) => ({
  milestones: [],
  loading: false,
  setMilestones: (milestones) => set({ milestones }),
  updateMilestone: (milestoneId, changes) =>
    set((state) => ({
      milestones: state.milestones.map((m) =>
        m.milestone_id === milestoneId ? { ...m, ...changes } : m,
      ),
    })),
  removeMilestone: (milestoneId) =>
    set((state) => ({
      milestones: state.milestones.filter((m) => m.milestone_id !== milestoneId),
    })),
  setLoading: (loading) => set({ loading }),
  clear: () => set({ milestones: [], loading: false }),
}))
