import { useState, useMemo, useCallback } from 'react'

interface UsePaginationReturn<T> {
  page: number
  totalPages: number
  paginatedItems: T[]
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  pageSize: number
}

export function usePagination<T>(items: T[], pageSize: number = 50): UsePaginationReturn<T> {
  const [page, setPage] = useState(1)

  const totalPages = useMemo(() => Math.max(1, Math.ceil(items.length / pageSize)), [items.length, pageSize])

  // Reset to page 1 if current page exceeds total pages (e.g. after filtering)
  const safePage = useMemo(() => {
    if (page > totalPages) return 1
    return page
  }, [page, totalPages])

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, safePage, pageSize])

  const goToPage = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage)
      }
    },
    [totalPages],
  )

  const nextPage = useCallback(() => {
    goToPage(safePage + 1)
  }, [safePage, goToPage])

  const prevPage = useCallback(() => {
    goToPage(safePage - 1)
  }, [safePage, goToPage])

  return {
    page: safePage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    pageSize,
  }
}
