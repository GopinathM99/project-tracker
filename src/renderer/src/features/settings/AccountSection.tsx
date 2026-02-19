import { useState } from 'react'
import { deleteUser } from 'firebase/auth'
import { auth } from '@/lib/auth'
import { useAuthStore } from '@/stores/authStore'
import { memberService } from '@/services/member-service'
import { workspaceService } from '@/services/workspace-service'
import { AlertTriangle, Shield, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'

export default function AccountSection(): JSX.Element {
  const user = useAuthStore((s) => s.user)

  const [step, setStep] = useState<'idle' | 'checking' | 'blocked' | 'confirm' | 'deleting'>(
    'idle',
  )
  const [blockReason, setBlockReason] = useState<string | null>(null)
  const [confirmText, setConfirmText] = useState('')
  const [error, setError] = useState<string | null>(null)

  /**
   * Begin the account deletion flow.
   * First check if the user is the only Owner of any workspace.
   */
  async function handleDeleteStart(): Promise<void> {
    if (!user) return
    setStep('checking')
    setError(null)
    setBlockReason(null)

    try {
      // Get all workspaces the user belongs to
      const workspaces = await workspaceService.getUserWorkspaces()

      // Check each workspace where the user is an Owner
      for (const ws of workspaces) {
        const members = await memberService.getWorkspaceMembers(ws.workspace_id)
        const currentMember = members.find((m) => m.user_id === user.uid)

        if (currentMember?.role === 'Owner') {
          const ownerCount = members.filter((m) => m.role === 'Owner').length
          if (ownerCount <= 1 && members.length > 1) {
            setBlockReason(
              `You are the only Owner of workspace "${ws.name}". You must transfer ownership to another member before deleting your account.`,
            )
            setStep('blocked')
            return
          }
        }
      }

      // No blockers found, proceed to confirmation
      setStep('confirm')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to check workspace ownership'
      setError(message)
      setStep('idle')
    }
  }

  /**
   * Execute the account deletion.
   */
  async function handleDeleteConfirm(): Promise<void> {
    if (!auth.currentUser) return
    if (confirmText !== 'DELETE') return

    setStep('deleting')
    setError(null)

    try {
      await deleteUser(auth.currentUser)
      // Firebase auth state listener will handle navigation
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete account'
      // Firebase may require recent auth for account deletion
      if (message.includes('requires-recent-login') || (err as { code?: string }).code === 'auth/requires-recent-login') {
        setError(
          'For security reasons, please sign out and sign back in before deleting your account.',
        )
      } else {
        setError(message)
      }
      setStep('idle')
    }
  }

  function handleCancel(): void {
    setStep('idle')
    setBlockReason(null)
    setConfirmText('')
    setError(null)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account settings and data.
        </p>
      </div>

      {/* Account Info */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-medium text-foreground">Account Information</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium text-foreground">{user?.email ?? '--'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Display Name</span>
            <span className="text-sm font-medium text-foreground">
              {user?.displayName ?? '--'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Account ID</span>
            <span className="text-xs font-mono text-muted-foreground">{user?.uid ?? '--'}</span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg border border-destructive/30 bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-destructive" />
          <h2 className="text-sm font-medium text-destructive">Danger Zone</h2>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Blocked state */}
        {step === 'blocked' && blockReason && (
          <div className="mb-4 rounded-md border border-yellow-500/50 bg-yellow-500/10 px-4 py-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
              <p className="text-sm text-yellow-500">{blockReason}</p>
            </div>
          </div>
        )}

        {/* Confirmation input */}
        {step === 'confirm' && (
          <div className="mb-4 space-y-3">
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">
                  This will permanently delete your account. All your workspace memberships will
                  become orphaned. Type <strong>DELETE</strong> below to confirm.
                </p>
              </div>
            </div>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder='Type "DELETE" to confirm'
              className="w-full rounded-md border border-destructive/50 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive"
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          {step === 'idle' && (
            <button
              type="button"
              onClick={handleDeleteStart}
              className="flex items-center gap-2 rounded-md border border-destructive/50 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          )}

          {step === 'checking' && (
            <button
              type="button"
              disabled
              className="flex items-center gap-2 rounded-md border border-destructive/50 px-4 py-2 text-sm font-medium text-destructive opacity-50 cursor-not-allowed"
            >
              Checking...
            </button>
          )}

          {step === 'blocked' && (
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
            >
              Dismiss
            </button>
          )}

          {step === 'confirm' && (
            <>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={confirmText !== 'DELETE'}
                className={cn(
                  'flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors',
                  confirmText !== 'DELETE' && 'opacity-50 cursor-not-allowed',
                )}
              >
                <Trash2 className="h-4 w-4" />
                Permanently Delete
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </>
          )}

          {step === 'deleting' && (
            <button
              type="button"
              disabled
              className="flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground opacity-50 cursor-not-allowed"
            >
              Deleting...
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
