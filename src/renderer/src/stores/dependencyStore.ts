import { create } from 'zustand'
import type { DependencyLink } from '@shared/schemas'

interface DependencyState {
  dependencies: DependencyLink[]
  setDependencies: (deps: DependencyLink[]) => void
  addDependency: (dep: DependencyLink) => void
  removeDependency: (depId: string) => void
  clear: () => void
}

export const useDependencyStore = create<DependencyState>((set) => ({
  dependencies: [],
  setDependencies: (dependencies) => set({ dependencies }),
  addDependency: (dep) =>
    set((state) => ({
      dependencies: [...state.dependencies, dep],
    })),
  removeDependency: (depId) =>
    set((state) => ({
      dependencies: state.dependencies.filter((d) => d.dependency_id !== depId),
    })),
  clear: () => set({ dependencies: [] }),
}))
