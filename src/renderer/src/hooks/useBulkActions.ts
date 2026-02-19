import { useState, useCallback, useMemo } from 'react'

interface UseBulkActionsReturn {
  selectedIds: Set<string>
  toggleSelect: (id: string) => void
  selectAll: () => void
  clearSelection: () => void
  isSelected: (id: string) => boolean
  selectedCount: number
}

export function useBulkActions<T extends Record<string, unknown>>(
  items: T[],
  idField: string,
): UseBulkActionsReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    const allIds = new Set(items.map((item) => String(item[idField])))
    setSelectedIds(allIds)
  }, [items, idField])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  )

  const selectedCount = useMemo(() => selectedIds.size, [selectedIds])

  return {
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    isSelected,
    selectedCount,
  }
}
