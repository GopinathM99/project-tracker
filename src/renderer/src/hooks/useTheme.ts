import { useEffect } from 'react'
import { useUserPreferencesStore } from '@/stores/userPreferencesStore'

/**
 * Reads the user's theme preference and applies it to the DOM.
 * - 'System': follows OS preference via matchMedia
 * - 'Light': removes 'dark' class from documentElement
 * - 'Dark': adds 'dark' class to documentElement
 */
export function useTheme(): void {
  const theme = useUserPreferencesStore((s) => s.preferences?.theme ?? 'System')

  useEffect(() => {
    function applyTheme(isDark: boolean): void {
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    if (theme === 'Dark') {
      applyTheme(true)
      return
    }

    if (theme === 'Light') {
      applyTheme(false)
      return
    }

    // theme === 'System'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    applyTheme(mediaQuery.matches)

    function handleChange(e: MediaQueryListEvent): void {
      applyTheme(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])
}
