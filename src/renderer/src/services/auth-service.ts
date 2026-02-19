import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from 'firebase/auth'
import { auth } from '@/lib/auth'

/**
 * Maps Firebase Auth error codes to user-friendly messages.
 */
export function mapFirebaseError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists'
    case 'auth/invalid-email':
      return 'Invalid email address'
    case 'auth/user-disabled':
      return 'This account has been disabled'
    case 'auth/user-not-found':
      return 'No account found with this email'
    case 'auth/wrong-password':
      return 'Incorrect password'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later'
    case 'auth/invalid-credential':
      return 'Invalid email or password'
    default:
      return 'An unexpected error occurred. Please try again'
  }
}

/**
 * Custom error class for authentication errors.
 * Extends Error with a `code` field for the original Firebase error code.
 */
export class AuthError extends Error {
  code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}

/**
 * Wraps a Firebase Auth operation, catching errors and re-throwing
 * as AuthError with user-friendly messages.
 */
async function withAuthErrorHandling<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string }
    const code = firebaseError.code ?? 'auth/unknown'
    const message = mapFirebaseError(code)
    throw new AuthError(message, code)
  }
}

export const authService = {
  /**
   * Create a new user account with email, password, and display name.
   */
  async signUp(email: string, password: string, displayName: string): Promise<User> {
    return withAuthErrorHandling(async () => {
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(credential.user, { displayName })
      return credential.user
    })
  },

  /**
   * Sign in an existing user with email and password.
   */
  async signIn(email: string, password: string): Promise<User> {
    return withAuthErrorHandling(async () => {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      return credential.user
    })
  },

  /**
   * Sign out the current user.
   */
  async signOut(): Promise<void> {
    return withAuthErrorHandling(async () => {
      await firebaseSignOut(auth)
    })
  },

  /**
   * Send a password reset email to the given address.
   */
  async resetPassword(email: string): Promise<void> {
    return withAuthErrorHandling(async () => {
      await sendPasswordResetEmail(auth, email)
    })
  },
}
