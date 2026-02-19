import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'
import { useUserPreferencesStore } from '@/stores/userPreferencesStore'
import { userPreferencesService } from '@/services/user-preferences-service'
import type { UserPreferences } from '@shared/schemas'

export function useUserPreferences() {
  const workspaceId = useAppStore((s) => s.currentWorkspaceId)
  const user = useAuthStore((s) => s.user)
  const preferences = useUserPreferencesStore((s) => s.preferences)
  const loading = useUserPreferencesStore((s) => s.loading)
  const setPreferences = useUserPreferencesStore((s) => s.setPreferences)
  const setLoading = useUserPreferencesStore((s) => s.setLoading)
  const defaultsCreatedRef = useRef(false)

  useEffect(() => {
    if (!workspaceId || !user) {
      setPreferences(null)
      setLoading(false)
      return
    }

    defaultsCreatedRef.current = false
    setLoading(true)

    const unsubscribe = userPreferencesService.subscribeToPreferences(
      workspaceId,
      (prefs) => {
        if (prefs) {
          setPreferences(prefs)
          setLoading(false)
        } else if (!defaultsCreatedRef.current) {
          // No preferences doc exists — create defaults
          defaultsCreatedRef.current = true
          userPreferencesService
            .createDefaultPreferences(workspaceId)
            .then((defaults) => {
              setPreferences(defaults)
            })
            .catch(() => {
              // Defaults will be created on next attempt
            })
            .finally(() => {
              setLoading(false)
            })
        } else {
          setLoading(false)
        }
      },
    )

    return () => {
      unsubscribe()
    }
  }, [workspaceId, user?.uid, setPreferences, setLoading])

  const updatePreference = useCallback(
    async (changes: Partial<UserPreferences>) => {
      if (!workspaceId) return
      await userPreferencesService.updatePreferences(workspaceId, changes)
    },
    [workspaceId],
  )

  return { preferences, loading, updatePreference }
}
