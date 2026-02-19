import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { authService, AuthError } from '@/services/auth-service'

export default function ForgotPasswordPage(): JSX.Element {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { error, setError, clearError } = useAuthStore()

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    clearError()
    setSuccess(false)
    setLoading(true)

    try {
      await authService.resetPassword(email)
      setSuccess(true)
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred. Please try again')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Project Tracker</h1>
          <p className="mt-1 text-sm text-muted-foreground">Reset your password</p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md border border-green-500/50 bg-green-500/10 px-4 py-3">
            <p className="text-sm text-green-700 dark:text-green-400">
              Check your email for a password reset link
            </p>
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            We sent a reset link to <span className="font-medium text-foreground">{email}</span>.
            Check your inbox and follow the instructions to reset your password.
          </p>
        )}

        <div className="mt-4 text-center text-sm">
          <Link to="/login" className="text-primary hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
