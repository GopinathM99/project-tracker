import { create } from 'zustand'
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, startOfDay } from 'date-fns'

export type CalendarViewMode = 'month' | 'week' | 'day'

interface CalendarState {
  viewMode: CalendarViewMode
  setViewMode: (mode: CalendarViewMode) => void
  currentDate: Date
  setCurrentDate: (d: Date) => void
  goToToday: () => void
  goNext: () => void
  goPrev: () => void
  // Filters
  projectFilter: string | null
  setProjectFilter: (id: string | null) => void
  statusFilter: string[]
  setStatusFilter: (statuses: string[]) => void
  ownerFilter: string
  setOwnerFilter: (owner: string) => void
  clearFilters: () => void
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  viewMode: 'month',
  setViewMode: (mode) => set({ viewMode: mode }),
  currentDate: startOfDay(new Date()),
  setCurrentDate: (d) => set({ currentDate: startOfDay(d) }),
  goToToday: () => set({ currentDate: startOfDay(new Date()) }),
  goNext: () => {
    const { viewMode, currentDate } = get()
    switch (viewMode) {
      case 'month':
        set({ currentDate: addMonths(currentDate, 1) })
        break
      case 'week':
        set({ currentDate: addWeeks(currentDate, 1) })
        break
      case 'day':
        set({ currentDate: addDays(currentDate, 1) })
        break
    }
  },
  goPrev: () => {
    const { viewMode, currentDate } = get()
    switch (viewMode) {
      case 'month':
        set({ currentDate: subMonths(currentDate, 1) })
        break
      case 'week':
        set({ currentDate: subWeeks(currentDate, 1) })
        break
      case 'day':
        set({ currentDate: subDays(currentDate, 1) })
        break
    }
  },
  // Filters
  projectFilter: null,
  setProjectFilter: (id) => set({ projectFilter: id }),
  statusFilter: [],
  setStatusFilter: (statuses) => set({ statusFilter: statuses }),
  ownerFilter: '',
  setOwnerFilter: (owner) => set({ ownerFilter: owner }),
  clearFilters: () =>
    set({
      projectFilter: null,
      statusFilter: [],
      ownerFilter: '',
    }),
}))
