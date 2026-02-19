import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications'
import {
  LayoutDashboard,
  FolderKanban,
  Calendar,
  Search,
  Settings,
  Bell,
  Columns3,
  Trash2,
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/kanban/monthly', label: 'Monthly Kanban', icon: Columns3 },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/trash', label: 'Trash', icon: Trash2 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ collapsed }: SidebarProps): JSX.Element {
  const workspace = useWorkspaceStore((s) => s.workspace)
  const { unreadCount } = useUnreadNotifications()

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200',
        collapsed ? 'w-16' : 'w-56',
      )}
    >
      {/* Drag region for macOS traffic lights */}
      <div className="drag-region flex h-12 shrink-0 items-center px-3">
        {!collapsed && workspace && (
          <span className="truncate text-sm font-semibold text-sidebar-foreground">
            {workspace.name}
          </span>
        )}
      </div>

      <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-1 p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'no-drag flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                collapsed && 'justify-center px-0',
              )
            }
          >
            <div className="relative shrink-0">
              <item.icon className="h-4 w-4" />
              {item.to === '/notifications' && unreadCount > 0 && (
                <span
                  aria-live="polite"
                  aria-label={`${unreadCount} unread notifications`}
                  className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
