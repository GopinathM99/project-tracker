import { Keyboard } from 'lucide-react'

const isMac =
  typeof window !== 'undefined' &&
  (window.electronAPI?.platform === 'darwin' ||
    navigator.userAgent.includes('Mac'))

function formatKey(mac: string, other: string): string {
  return isMac ? mac : other
}

interface ShortcutEntry {
  keys: string
  description: string
  category: string
}

const shortcuts: ShortcutEntry[] = [
  // Navigation
  { keys: formatKey('Cmd+K', 'Ctrl+K'), description: 'Open search', category: 'Navigation' },
  { keys: formatKey('Cmd+/', 'Ctrl+/'), description: 'Keyboard shortcuts', category: 'Navigation' },
  { keys: formatKey('Cmd+1', 'Ctrl+1'), description: 'Go to Dashboard', category: 'Navigation' },
  { keys: formatKey('Cmd+2', 'Ctrl+2'), description: 'Go to Projects', category: 'Navigation' },
  { keys: formatKey('Cmd+3', 'Ctrl+3'), description: 'Go to Calendar', category: 'Navigation' },

  // Actions
  { keys: formatKey('Cmd+N', 'Ctrl+N'), description: 'New task (from project context)', category: 'Actions' },
  { keys: formatKey('Cmd+Shift+P', 'Ctrl+Shift+P'), description: 'New project', category: 'Actions' },
  { keys: formatKey('Cmd+Z', 'Ctrl+Z'), description: 'Undo', category: 'Actions' },
  { keys: formatKey('Cmd+Shift+Z', 'Ctrl+Shift+Z'), description: 'Redo', category: 'Actions' },

  // View
  { keys: formatKey('Cmd+B', 'Ctrl+B'), description: 'Toggle sidebar', category: 'View' },
  { keys: formatKey('Cmd+Shift+N', 'Ctrl+Shift+N'), description: 'New window', category: 'View' },
]

export default function ShortcutsSection(): JSX.Element {
  const categories = [...new Set(shortcuts.map((s) => s.category))]

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Keyboard Shortcuts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quick reference for all available keyboard shortcuts.
          {isMac ? ' Showing macOS shortcuts.' : ' Showing Windows/Linux shortcuts.'}
        </p>
      </div>

      {categories.map((category) => (
        <div key={category} className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground">{category}</h2>
          </div>
          <div className="space-y-2">
            {shortcuts
              .filter((s) => s.category === category)
              .map((shortcut) => (
                <div
                  key={shortcut.keys}
                  className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-accent/50"
                >
                  <span className="text-sm text-foreground">{shortcut.description}</span>
                  <kbd className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-mono text-muted-foreground">
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
