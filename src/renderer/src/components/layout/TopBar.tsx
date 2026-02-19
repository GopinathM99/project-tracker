import { useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/auth-service'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { PanelLeft, LogOut, Search, Wifi, WifiOff } from 'lucide-react'

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/kanban/monthly': 'Monthly Kanban',
  '/calendar': 'Calendar',
  '/search': 'Search',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
}

export function TopBar(): JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const user = useAuthStore((s) => s.user)
  const clearWorkspace = useWorkspaceStore((s) => s.clear)

  const { isOnline } = useOnlineStatus()

  const title = routeTitles[location.pathname] || 'Project Tracker'

  async function handleSignOut(): Promise<void> {
    try {
      clearWorkspace()
      await authService.signOut()
      navigate('/login', { replace: true })
    } catch {
      // Sign-out errors are rare; still navigate to login
      navigate('/login', { replace: true })
    }
  }

  return (
    <header className="drag-region flex h-12 shrink-0 items-center gap-3 border-b border-border px-4">
      <button
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        className="no-drag rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
      >
        <PanelLeft className="h-4 w-4" />
      </button>
      <h1 className="text-sm font-medium text-foreground">{title}</h1>

      {isOnline ? (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground" title="Online">
          <Wifi className="h-3.5 w-3.5 text-green-500" />
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-orange-500" title="Offline">
          <WifiOff className="h-3.5 w-3.5" />
          <span>Offline</span>
        </div>
      )}

      <div className="ml-auto flex items-center gap-3">
        <button
          onClick={() => navigate('/search')}
          aria-label="Search (⌘K)"
          className="no-drag flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          title="Search (⌘K)"
        >
          <Search className="h-3.5 w-3.5" />
          <kbd className="hidden rounded border border-border bg-muted px-1 py-0.5 text-[10px] font-medium sm:inline-block">
            ⌘K
          </kbd>
        </button>
        {user && (
          <span className="text-xs text-muted-foreground">{user.email}</span>
        )}
        <button
          onClick={handleSignOut}
          aria-label="Sign out"
          className="no-drag flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          title="Sign out"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign out</span>
        </button>
      </div>
    </header>
  )
}
