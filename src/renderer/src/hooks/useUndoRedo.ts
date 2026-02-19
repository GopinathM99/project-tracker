import { useUndoRedoStore, type UndoAction } from '@/stores/undoRedoStore'

/**
 * Hook that provides undo/redo functionality.
 * Keyboard shortcuts (Cmd+Z, Cmd+Shift+Z) are handled by useGlobalShortcuts.
 */
export function useUndoRedo() {
  const undoStack = useUndoRedoStore((s) => s.undoStack)
  const redoStack = useUndoRedoStore((s) => s.redoStack)
  const canUndo = useUndoRedoStore((s) => s.canUndo)
  const canRedo = useUndoRedoStore((s) => s.canRedo)
  const pushAction = useUndoRedoStore((s) => s.pushAction)
  const undo = useUndoRedoStore((s) => s.undo)
  const redo = useUndoRedoStore((s) => s.redo)

  return {
    undoStack,
    redoStack,
    canUndo,
    canRedo,
    pushAction: pushAction as (action: Omit<UndoAction, 'id' | 'timestamp'>) => void,
    undo,
    redo,
  }
}
