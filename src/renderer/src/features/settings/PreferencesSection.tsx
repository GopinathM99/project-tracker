import { useUserPreferences } from '@/hooks/useUserPreferences'
import { LoadingState } from '@/components/shared/LoadingState'
import { cn } from '@/lib/cn'
import { Sun, Moon, Monitor, LayoutDashboard, Columns3, Calendar, List, Bell, PanelLeft } from 'lucide-react'

const THEME_OPTIONS = [
  { value: 'System' as const, label: 'System', icon: Monitor, description: 'Follow OS preference' },
  { value: 'Light' as const, label: 'Light', icon: Sun, description: 'Always use light theme' },
  { value: 'Dark' as const, label: 'Dark', icon: Moon, description: 'Always use dark theme' },
]

const VIEW_OPTIONS = [
  { value: 'Dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { value: 'Kanban' as const, label: 'Kanban', icon: Columns3 },
  { value: 'Calendar' as const, label: 'Calendar', icon: Calendar },
  { value: 'TaskList' as const, label: 'Task List', icon: List },
]

const NOTIFICATION_OPTIONS = [
  { key: 'notification_reminders' as const, label: 'Reminders', description: 'Receive reminders for upcoming due dates' },
  { key: 'notification_overdue' as const, label: 'Overdue', description: 'Get notified about overdue tasks' },
  { key: 'notification_assignments' as const, label: 'Assignments', description: 'Get notified when assigned to tasks or bugs' },
  { key: 'notification_comments' as const, label: 'Comments', description: 'Get notified about new comments' },
  { key: 'notification_status_changes' as const, label: 'Status Changes', description: 'Get notified when statuses change' },
]

export default function PreferencesSection(): JSX.Element {
  const { preferences, loading, updatePreference } = useUserPreferences()

  if (loading || !preferences) {
    return <LoadingState />
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Preferences</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Customize your workspace experience.
        </p>
      </div>

      {/* Theme Section */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-medium text-foreground">Theme</h2>
        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updatePreference({ theme: option.value })}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors',
                preferences.theme === option.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
              )}
            >
              <option.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{option.label}</span>
              <span className="text-xs opacity-70">{option.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Default View Section */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-medium text-foreground">Default View</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Choose which view to show when you open a project.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updatePreference({ default_view: option.value })}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors',
                preferences.default_view === option.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
              )}
            >
              <option.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground">Notifications</h2>
        </div>
        <div className="space-y-4">
          {NOTIFICATION_OPTIONS.map((option) => (
            <label
              key={option.key}
              className="flex items-center justify-between gap-4"
            >
              <div>
                <span className="text-sm font-medium text-foreground">{option.label}</span>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={preferences[option.key]}
                onClick={() =>
                  updatePreference({ [option.key]: !preferences[option.key] })
                }
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                  preferences[option.key] ? 'bg-primary' : 'bg-muted',
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform',
                    preferences[option.key] ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* Sidebar Default */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <PanelLeft className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground">Sidebar</h2>
        </div>
        <label className="flex items-center justify-between gap-4">
          <div>
            <span className="text-sm font-medium text-foreground">Collapsed by Default</span>
            <p className="text-xs text-muted-foreground">
              Start with the sidebar collapsed when opening the app.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={preferences.sidebar_collapsed}
            onClick={() =>
              updatePreference({ sidebar_collapsed: !preferences.sidebar_collapsed })
            }
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
              preferences.sidebar_collapsed ? 'bg-primary' : 'bg-muted',
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform',
                preferences.sidebar_collapsed ? 'translate-x-5' : 'translate-x-0',
              )}
            />
          </button>
        </label>
      </div>
    </div>
  )
}
