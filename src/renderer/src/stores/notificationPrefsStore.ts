import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NotificationPrefsState {
  remindersEnabled: boolean
  overdueEnabled: boolean
  setRemindersEnabled: (v: boolean) => void
  setOverdueEnabled: (v: boolean) => void
}

export const useNotificationPrefsStore = create<NotificationPrefsState>()(
  persist(
    (set) => ({
      remindersEnabled: true,
      overdueEnabled: true,
      setRemindersEnabled: (v) => set({ remindersEnabled: v }),
      setOverdueEnabled: (v) => set({ overdueEnabled: v }),
    }),
    { name: 'notification-prefs' },
  ),
)
