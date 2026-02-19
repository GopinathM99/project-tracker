import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { inviteService } from '@/services/invite-service'
import { useAppStore } from '@/stores/appStore'
import { Check, AlertTriangle, Loader2 } from 'lucide-react'

export default function AcceptInvitePage(): JSX.Element {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setCurrentWorkspace = useAppStore((s) => s.setCurrentWorkspace)

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setError('No invite token provided. Please check your invite link.')
      setStatus('error')
      return
    }

    async function acceptInvite(rawToken: string): Promise<void> {
      try {
        const result = await inviteService.acceptInvite(rawToken)
        setWorkspaceId(result.workspaceId)
        setStatus('success')
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to accept invite'
        setError(message)
        setStatus('error')
      }
    }

    acceptInvite(token)
  }, [searchParams])

  function handleGoToDashboard(): void {
    if (workspaceId) {
      setCurrentWorkspace(workspaceId)
    }
    navigate('/dashboard', { replace: true })
  }

  function handleGoToLogin(): void {
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center">
        {/* Loading state */}
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <h1 className="text-lg font-semibold text-foreground">Accepting Invite</h1>
            <p className="text-sm text-muted-foreground">
              Please wait while we process your invite...
            </p>
          </div>
        )}

        {/* Success state */}
        {status === 'success' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Invite Accepted</h1>
            <p className="text-sm text-muted-foreground">
              You have been added to the workspace. You can now access all shared projects and tasks.
            </p>
            <button
              type="button"
              onClick={handleGoToDashboard}
              className="mt-2 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Invite Failed</h1>
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={handleGoToLogin}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
              >
                Go to Login
              </button>
              <button
                type="button"
                onClick={handleGoToDashboard}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
