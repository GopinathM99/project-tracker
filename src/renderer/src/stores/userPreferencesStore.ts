import { create } from 'zustand'
import type { UserPreferences } from '@shared/schemas'

interface UserPreferencesState {
  preferences: UserPreferences | null
  loading: boolean
  setPreferences: (prefs: UserPreferences | null) => void
  setLoading: (loading: boolean) => void
}

export const useUserPreferencesStore = create<UserPreferencesState>((set) => ({
  preferences: null,
  loading: true,
  setPreferences: (prefs) => set({ preferences: prefs }),
  setLoading: (loading) => set({ loading }),
}))
