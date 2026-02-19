import { useEffect, useState } from 'react'
import { Undo2, X } from 'lucide-react'
import { cn } from '@/lib/cn'

interface UndoToastProps {
  message: string
  onUndo: () => void
  onDismiss: () => void
}

/**
 * A small toast notification that appears at bottom-center when an undoable action
 * is performed. Shows a message with an "Undo" button. Auto-dismisses after 5 seconds.
 */
export function UndoToast({ message, onUndo, onDismiss }: UndoToastProps): JSX.Element {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      // Wait for exit animation before calling onDismiss
      setTimeout(onDismiss, 200)
    }, 5000)

    return () => clearTimeout(timer)
  }, [onDismiss])

  function handleUndo(): void {
    onUndo()
    setVisible(false)
    setTimeout(onDismiss, 200)
  }

  function handleDismiss(): void {
    setVisible(false)
    setTimeout(onDismiss, 200)
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-lg transition-all duration-200',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
      )}
    >
      <span className="text-sm text-foreground">{message}</span>
      <button
        type="button"
        onClick={handleUndo}
        className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Undo2 className="h-3 w-3" />
        Undo
      </button>
      <button
        type="button"
        onClick={handleDismiss}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
