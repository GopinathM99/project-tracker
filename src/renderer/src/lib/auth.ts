import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { app } from './firebase'
import { useAuthStore } from '@/stores/authStore'

export const auth = getAuth(app)

/**
 * Initialize the Firebase Auth state listener.
 * Clears errors on auth state change and updates the auth store.
 * Returns a cleanup function to unsubscribe the listener.
 */
export function initAuth(): () => void {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    const store = useAuthStore.getState()
    store.clearError()
    store.setUser(user)
  })
  return unsubscribe
}

// Set up the listener immediately on module load
const _cleanup = initAuth()
