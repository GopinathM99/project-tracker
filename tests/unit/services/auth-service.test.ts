import { describe, it, expect, vi } from 'vitest'

// Mock the auth module to prevent Firebase initialization during tests
vi.mock('@/lib/auth', () => ({
  auth: {},
}))

import { AuthError, mapFirebaseError, authService } from '@/services/auth-service'

describe('AuthError', () => {
  it('can be instantiated with message and code', () => {
    const error = new AuthError('Test message', 'auth/test-code')
    expect(error).toBeInstanceOf(AuthError)
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('Test message')
    expect(error.code).toBe('auth/test-code')
    expect(error.name).toBe('AuthError')
  })

  it('has correct prototype chain', () => {
    const error = new AuthError('msg', 'code')
    expect(error instanceof Error).toBe(true)
    expect(error instanceof AuthError).toBe(true)
  })
})

describe('mapFirebaseError', () => {
  it('maps auth/email-already-in-use', () => {
    expect(mapFirebaseError('auth/email-already-in-use')).toBe(
      'An account with this email already exists',
    )
  })

  it('maps auth/invalid-email', () => {
    expect(mapFirebaseError('auth/invalid-email')).toBe('Invalid email address')
  })

  it('maps auth/user-disabled', () => {
    expect(mapFirebaseError('auth/user-disabled')).toBe('This account has been disabled')
  })

  it('maps auth/user-not-found', () => {
    expect(mapFirebaseError('auth/user-not-found')).toBe('No account found with this email')
  })

  it('maps auth/wrong-password', () => {
    expect(mapFirebaseError('auth/wrong-password')).toBe('Incorrect password')
  })

  it('maps auth/weak-password', () => {
    expect(mapFirebaseError('auth/weak-password')).toBe('Password must be at least 6 characters')
  })

  it('maps auth/too-many-requests', () => {
    expect(mapFirebaseError('auth/too-many-requests')).toBe(
      'Too many attempts. Please try again later',
    )
  })

  it('maps auth/invalid-credential', () => {
    expect(mapFirebaseError('auth/invalid-credential')).toBe('Invalid email or password')
  })

  it('returns default message for unknown error codes', () => {
    expect(mapFirebaseError('auth/some-unknown-code')).toBe(
      'An unexpected error occurred. Please try again',
    )
  })

  it('returns default message for empty string', () => {
    expect(mapFirebaseError('')).toBe('An unexpected error occurred. Please try again')
  })
})

describe('authService', () => {
  it('exports expected methods', () => {
    expect(authService).toBeDefined()
    expect(typeof authService.signUp).toBe('function')
    expect(typeof authService.signIn).toBe('function')
    expect(typeof authService.signOut).toBe('function')
    expect(typeof authService.resetPassword).toBe('function')
  })
})
