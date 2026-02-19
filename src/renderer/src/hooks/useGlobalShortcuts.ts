import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUndoRedoStore } from '@/stores/undoRedoStore'
import { useAppStore } from '@/stores/appStore'

/**
 * Registers global keyboard shortcuts for the app.
 * - Cmd+K / Ctrl+K: Navigate to /search
 * - Cmd+Z / Ctrl+Z: Undo
 * - Cmd+Shift+Z / Ctrl+Shift+Z: Redo
 * - Cmd+/ / Ctrl+/: Navigate to /settings/shortcuts
 * - Cmd+B / Ctrl+B: Toggle sidebar
 */
export function useGlobalShortcuts(): void {
  const navigate = useNavigate()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      const mod = e.metaKey || e.ctrlKey

      // Cmd+K or Ctrl+K -> navigate to search
      if (mod && e.key === 'k') {
        e.preventDefault()
        navigate('/search')
        return
      }

      // Cmd+Shift+Z or Ctrl+Shift+Z -> redo
      if (mod && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        void useUndoRedoStore.getState().redo()
        return
      }

      // Cmd+Z or Ctrl+Z -> undo (only when not in an input/textarea)
      if (mod && !e.shiftKey && e.key === 'z') {
        const target = e.target as HTMLElement
        const isEditable =
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        if (!isEditable) {
          e.preventDefault()
          void useUndoRedoStore.getState().undo()
        }
        return
      }

      // Cmd+/ or Ctrl+/ -> navigate to keyboard shortcuts
      if (mod && e.key === '/') {
        e.preventDefault()
        navigate('/settings/shortcuts')
        return
      }

      // Cmd+B or Ctrl+B -> toggle sidebar
      if (mod && e.key === 'b') {
        e.preventDefault()
        useAppStore.getState().toggleSidebar()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])
}
