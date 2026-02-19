import { create } from 'zustand'
import type { Project } from '@shared/schemas'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  loading: boolean
  setProjects: (projects: Project[]) => void
  setCurrentProject: (project: Project | null) => void
  updateProject: (projectId: string, changes: Partial<Project>) => void
  removeProject: (projectId: string) => void
  setLoading: (loading: boolean) => void
  clear: () => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  loading: false,
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (currentProject) => set({ currentProject }),
  updateProject: (projectId, changes) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.project_id === projectId ? { ...p, ...changes } : p
      ),
      currentProject:
        state.currentProject?.project_id === projectId
          ? { ...state.currentProject, ...changes }
          : state.currentProject,
    })),
  removeProject: (projectId) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.project_id !== projectId),
      currentProject:
        state.currentProject?.project_id === projectId ? null : state.currentProject,
    })),
  setLoading: (loading) => set({ loading }),
  clear: () => set({ projects: [], currentProject: null, loading: false }),
}))
