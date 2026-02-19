import { describe, it, expect, beforeEach } from 'vitest'
import { useNotificationPrefsStore } from '@/stores/notificationPrefsStore'

describe('notificationPrefsStore', () => {
  beforeEach(() => {
    // Reset to defaults
    useNotificationPrefsStore.setState({
      remindersEnabled: true,
      overdueEnabled: true,
    })
  })

  it('has correct initial state (both enabled)', () => {
    const state = useNotificationPrefsStore.getState()
    expect(state.remindersEnabled).toBe(true)
    expect(state.overdueEnabled).toBe(true)
  })

  it('setRemindersEnabled toggles reminders off', () => {
    useNotificationPrefsStore.getState().setRemindersEnabled(false)
    expect(useNotificationPrefsStore.getState().remindersEnabled).toBe(false)
  })

  it('setRemindersEnabled toggles reminders back on', () => {
    useNotificationPrefsStore.getState().setRemindersEnabled(false)
    useNotificationPrefsStore.getState().setRemindersEnabled(true)
    expect(useNotificationPrefsStore.getState().remindersEnabled).toBe(true)
  })

  it('setOverdueEnabled toggles overdue off', () => {
    useNotificationPrefsStore.getState().setOverdueEnabled(false)
    expect(useNotificationPrefsStore.getState().overdueEnabled).toBe(false)
  })

  it('setOverdueEnabled toggles overdue back on', () => {
    useNotificationPrefsStore.getState().setOverdueEnabled(false)
    useNotificationPrefsStore.getState().setOverdueEnabled(true)
    expect(useNotificationPrefsStore.getState().overdueEnabled).toBe(true)
  })

  it('toggling one preference does not affect the other', () => {
    useNotificationPrefsStore.getState().setRemindersEnabled(false)
    expect(useNotificationPrefsStore.getState().overdueEnabled).toBe(true)

    useNotificationPrefsStore.getState().setOverdueEnabled(false)
    expect(useNotificationPrefsStore.getState().remindersEnabled).toBe(false)
  })
})
