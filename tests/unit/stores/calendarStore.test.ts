import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useCalendarStore } from '@/stores/calendarStore'
import { startOfDay, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns'

describe('calendarStore', () => {
  // Use a fixed "now" so date-based tests are deterministic
  const fixedNow = new Date('2025-06-15T12:00:00.000Z')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(fixedNow)
    // Reset store state
    useCalendarStore.setState({
      viewMode: 'month',
      currentDate: startOfDay(fixedNow),
      projectFilter: null,
      statusFilter: [],
      ownerFilter: '',
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // --- Initial state ---

  it('has correct initial state', () => {
    const state = useCalendarStore.getState()
    expect(state.viewMode).toBe('month')
    expect(state.currentDate).toEqual(startOfDay(fixedNow))
    expect(state.projectFilter).toBeNull()
    expect(state.statusFilter).toEqual([])
    expect(state.ownerFilter).toBe('')
  })

  // --- View mode ---

  it('setViewMode changes to week', () => {
    useCalendarStore.getState().setViewMode('week')
    expect(useCalendarStore.getState().viewMode).toBe('week')
  })

  it('setViewMode changes to day', () => {
    useCalendarStore.getState().setViewMode('day')
    expect(useCalendarStore.getState().viewMode).toBe('day')
  })

  it('setViewMode changes back to month', () => {
    useCalendarStore.getState().setViewMode('day')
    useCalendarStore.getState().setViewMode('month')
    expect(useCalendarStore.getState().viewMode).toBe('month')
  })

  // --- Month navigation ---

  it('goNext in month view advances by one month', () => {
    useCalendarStore.getState().setViewMode('month')
    const before = useCalendarStore.getState().currentDate
    useCalendarStore.getState().goNext()
    expect(useCalendarStore.getState().currentDate).toEqual(addMonths(before, 1))
  })

  it('goPrev in month view goes back by one month', () => {
    useCalendarStore.getState().setViewMode('month')
    const before = useCalendarStore.getState().currentDate
    useCalendarStore.getState().goPrev()
    expect(useCalendarStore.getState().currentDate).toEqual(subMonths(before, 1))
  })

  // --- Week navigation ---

  it('goNext in week view advances by one week', () => {
    useCalendarStore.getState().setViewMode('week')
    const before = useCalendarStore.getState().currentDate
    useCalendarStore.getState().goNext()
    expect(useCalendarStore.getState().currentDate).toEqual(addWeeks(before, 1))
  })

  it('goPrev in week view goes back by one week', () => {
    useCalendarStore.getState().setViewMode('week')
    const before = useCalendarStore.getState().currentDate
    useCalendarStore.getState().goPrev()
    expect(useCalendarStore.getState().currentDate).toEqual(subWeeks(before, 1))
  })

  // --- Day navigation ---

  it('goNext in day view advances by one day', () => {
    useCalendarStore.getState().setViewMode('day')
    const before = useCalendarStore.getState().currentDate
    useCalendarStore.getState().goNext()
    expect(useCalendarStore.getState().currentDate).toEqual(addDays(before, 1))
  })

  it('goPrev in day view goes back by one day', () => {
    useCalendarStore.getState().setViewMode('day')
    const before = useCalendarStore.getState().currentDate
    useCalendarStore.getState().goPrev()
    expect(useCalendarStore.getState().currentDate).toEqual(subDays(before, 1))
  })

  // --- goToToday ---

  it('goToToday resets currentDate to today', () => {
    // Navigate away
    useCalendarStore.getState().goNext()
    useCalendarStore.getState().goNext()

    useCalendarStore.getState().goToToday()
    expect(useCalendarStore.getState().currentDate).toEqual(startOfDay(fixedNow))
  })

  // --- setCurrentDate ---

  it('setCurrentDate sets the date (normalized to start of day)', () => {
    const arbitraryDate = new Date('2024-03-10T15:30:00.000Z')
    useCalendarStore.getState().setCurrentDate(arbitraryDate)
    expect(useCalendarStore.getState().currentDate).toEqual(startOfDay(arbitraryDate))
  })

  // --- Filter setters ---

  it('setProjectFilter sets the project filter', () => {
    useCalendarStore.getState().setProjectFilter('proj-42')
    expect(useCalendarStore.getState().projectFilter).toBe('proj-42')
  })

  it('setProjectFilter can be set to null', () => {
    useCalendarStore.getState().setProjectFilter('proj-42')
    useCalendarStore.getState().setProjectFilter(null)
    expect(useCalendarStore.getState().projectFilter).toBeNull()
  })

  it('setStatusFilter sets status array', () => {
    useCalendarStore.getState().setStatusFilter(['Active', 'On Hold'])
    expect(useCalendarStore.getState().statusFilter).toEqual(['Active', 'On Hold'])
  })

  it('setOwnerFilter sets the owner', () => {
    useCalendarStore.getState().setOwnerFilter('alice')
    expect(useCalendarStore.getState().ownerFilter).toBe('alice')
  })

  // --- clearFilters ---

  it('clearFilters resets all filters to defaults', () => {
    useCalendarStore.getState().setProjectFilter('proj-1')
    useCalendarStore.getState().setStatusFilter(['Active'])
    useCalendarStore.getState().setOwnerFilter('bob')

    useCalendarStore.getState().clearFilters()

    const state = useCalendarStore.getState()
    expect(state.projectFilter).toBeNull()
    expect(state.statusFilter).toEqual([])
    expect(state.ownerFilter).toBe('')
  })

  it('clearFilters does not affect viewMode or currentDate', () => {
    useCalendarStore.getState().setViewMode('week')
    useCalendarStore.getState().goNext()
    const dateBefore = useCalendarStore.getState().currentDate

    useCalendarStore.getState().clearFilters()

    expect(useCalendarStore.getState().viewMode).toBe('week')
    expect(useCalendarStore.getState().currentDate).toEqual(dateBefore)
  })

  // --- Multiple navigations ---

  it('multiple goNext calls accumulate correctly', () => {
    const start = useCalendarStore.getState().currentDate
    useCalendarStore.getState().goNext()
    useCalendarStore.getState().goNext()
    useCalendarStore.getState().goNext()
    expect(useCalendarStore.getState().currentDate).toEqual(addMonths(start, 3))
  })

  it('goNext followed by goPrev returns to original date', () => {
    const start = useCalendarStore.getState().currentDate
    useCalendarStore.getState().goNext()
    useCalendarStore.getState().goPrev()
    expect(useCalendarStore.getState().currentDate).toEqual(start)
  })
})
