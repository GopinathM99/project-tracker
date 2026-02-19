import { useEffect, useState, useCallback } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { SyncStatusIndicator } from './SyncStatusIndicator'
import { useAppStore } from '@/stores/appStore'
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts'
import { useNotificationScheduler } from '@/hooks/useNotificationScheduler'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { useTheme } from '@/hooks/useTheme'
import { useSyncStatus } from '@/hooks/useSyncStatus'
import { OnboardingWizard } from '@/features/onboarding/OnboardingWizard'
import { errorLogger } from '@/lib/error-logger'

export function AppShell(): JSX.Element {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)
  const currentWorkspaceId = useAppStore((s) => s.currentWorkspaceId)
  const navigate = useNavigate()

  useGlobalShortcuts()
  useNotificationScheduler()
  useUserPreferences()
  useTheme()
  useSyncStatus()

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (currentWorkspaceId) {
      const completed = localStorage.getItem(`onboarding-completed-${currentWorkspaceId}`)
      if (!completed) {
        setShowOnboarding(true)
      }
    }
  }, [currentWorkspaceId])

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false)
  }, [])

  // Listen for menu navigation events from main process
  useEffect(() => {
    if (!window.electronAPI?.onMenuNavigate) return

    const cleanup = window.electronAPI.onMenuNavigate((route: string) => {
      if (route === '__toggle-sidebar__') {
        useAppStore.getState().toggleSidebar()
      } else {
        errorLogger.addBreadcrumb('navigate: ' + route, 'navigation')
        navigate(route)
      }
    })

    return cleanup
  }, [navigate])

  return (
    <div className="flex h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      {showOnboarding && <OnboardingWizard onComplete={handleOnboardingComplete} />}
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main id="main-content" className="flex-1 overflow-auto">
          <Outlet />
        </main>
        <SyncStatusIndicator />
      </div>
    </div>
  )
}
