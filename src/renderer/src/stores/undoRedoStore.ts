import { create } from 'zustand'
import { generateId } from '@shared/utils'
import { FIELD_LIMITS } from '@shared/constants/validation'

export interface UndoAction {
  id: string
  description: string
  undo: () => Promise<void>
  redo: () => Promise<void>
  timestamp: number
}

interface UndoRedoState {
  undoStack: UndoAction[]
  redoStack: UndoAction[]
  canUndo: boolean
  canRedo: boolean
  pushAction: (action: Omit<UndoAction, 'id' | 'timestamp'>) => void
  undo: () => Promise<void>
  redo: () => Promise<void>
  clear: () => void
}

export const useUndoRedoStore = create<UndoRedoState>((set, get) => ({
  undoStack: [],
  redoStack: [],
  canUndo: false,
  canRedo: false,

  pushAction: (action) => {
    const fullAction: UndoAction = {
      ...action,
      id: generateId(),
      timestamp: Date.now(),
    }

    set((state) => {
      const newStack = [fullAction, ...state.undoStack].slice(
        0,
        FIELD_LIMITS.UNDO_HISTORY_SIZE,
      )
      return {
        undoStack: newStack,
        redoStack: [],
        canUndo: newStack.length > 0,
        canRedo: false,
      }
    })
  },

  undo: async () => {
    const { undoStack, redoStack } = get()
    if (undoStack.length === 0) return

    const [action, ...remaining] = undoStack

    try {
      await action.undo()
    } catch {
      // If undo fails, don't modify stacks
      return
    }

    set({
      undoStack: remaining,
      redoStack: [action, ...redoStack].slice(0, FIELD_LIMITS.UNDO_HISTORY_SIZE),
      canUndo: remaining.length > 0,
      canRedo: true,
    })
  },

  redo: async () => {
    const { undoStack, redoStack } = get()
    if (redoStack.length === 0) return

    const [action, ...remaining] = redoStack

    try {
      await action.redo()
    } catch {
      // If redo fails, don't modify stacks
      return
    }

    set({
      undoStack: [action, ...undoStack].slice(0, FIELD_LIMITS.UNDO_HISTORY_SIZE),
      redoStack: remaining,
      canUndo: true,
      canRedo: remaining.length > 0,
    })
  },

  clear: () =>
    set({
      undoStack: [],
      redoStack: [],
      canUndo: false,
      canRedo: false,
    }),
}))
