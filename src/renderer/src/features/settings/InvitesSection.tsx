import { useCallback, useEffect, useState } from 'react'
import { inviteService } from '@/services/invite-service'
import { useWorkspaceId } from '@/hooks/useWorkspace'
import type { Invite } from '@shared/schemas'
import { cn } from '@/lib/cn'
import { Mail, Copy, Check, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'

type InviteRole = 'Member' | 'Viewer'

const statusBadgeStyles: Record<string, string> = {
  Pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  Accepted: 'bg-green-500/10 text-green-500 border-green-500/20',
  Expired: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  Revoked: 'bg-red-500/10 text-red-500 border-red-500/20',
}

export default function InvitesSection(): JSX.Element {
  const workspaceId = useWorkspaceId()

  // Invite creation form
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<InviteRole>('Member')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createdToken, setCreatedToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Invites list
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [revokeError, setRevokeError] = useState<string | null>(null)

  const fetchInvites = useCallback(async () => {
    if (!workspaceId) return
    setLoading(true)
    setListError(null)
    try {
      const data = await inviteService.getWorkspaceInvites(workspaceId)
      setInvites(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load invites'
      setListError(message)
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    if (!workspaceId) return

    const unsubscribe = inviteService.subscribeToWorkspaceInvites(workspaceId, (data) => {
      setInvites(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [workspaceId])

  /**
   * Validate email format simply.
   */
  function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  async function handleCreateInvite(): Promise<void> {
    if (!workspaceId) return

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      setCreateError('Email is required')
      return
    }
    if (!isValidEmail(trimmedEmail)) {
      setCreateError('Please enter a valid email address')
      return
    }

    setCreating(true)
    setCreateError(null)
    setCreatedToken(null)
    setCopied(false)

    try {
      const result = await inviteService.createInvite(workspaceId, trimmedEmail, role)
      setCreatedToken(result.token)
      setEmail('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create invite'
      setCreateError(message)
    } finally {
      setCreating(false)
    }
  }

  async function handleCopyToken(): Promise<void> {
    if (!createdToken) return
    try {
      await navigator.clipboard.writeText(createdToken)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select the text
      setCreateError('Failed to copy to clipboard. Please copy manually.')
    }
  }

  async function handleRevoke(inviteId: string): Promise<void> {
    if (!workspaceId) return
    setRevokeError(null)
    try {
      await inviteService.revokeInvite(workspaceId, inviteId)
      // Real-time subscription will update the list
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to revoke invite'
      setRevokeError(message)
    }
  }

  /**
   * Format an ISO date string for display.
   */
  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '--'
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return '--'
    }
  }

  /**
   * Check if an invite has expired based on its expires_at field.
   */
  function isExpired(invite: Invite): boolean {
    return invite.status === 'Pending' && invite.expires_at <= new Date().toISOString()
  }

  const pendingInvites = invites.filter((i) => i.status === 'Pending' && !isExpired(i))
  const historyInvites = invites.filter((i) => i.status !== 'Pending' || isExpired(i))

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Invites</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite new members to your workspace by email.
        </p>
      </div>

      {/* Create Invite form */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-medium text-foreground">Send an Invite</h2>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="inviteEmail" className="mb-1 block text-sm font-medium text-foreground">
              Email Address
            </label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input
                id="inviteEmail"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setCreateError(null)
                }}
                placeholder="colleague@example.com"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="w-32">
            <label htmlFor="inviteRole" className="mb-1 block text-sm font-medium text-foreground">
              Role
            </label>
            <select
              id="inviteRole"
              value={role}
              onChange={(e) => setRole(e.target.value as InviteRole)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Member">Member</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleCreateInvite}
            disabled={creating}
            className={cn(
              'rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors',
              creating && 'opacity-50 cursor-not-allowed',
            )}
          >
            {creating ? 'Sending...' : 'Send Invite'}
          </button>
        </div>

        {/* Error */}
        {createError && (
          <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3">
            <p className="text-sm text-destructive">{createError}</p>
          </div>
        )}

        {/* Created Token */}
        {createdToken && (
          <div className="mt-4 rounded-md border border-green-500/50 bg-green-500/10 px-4 py-3">
            <p className="mb-2 text-sm text-green-500">
              Invite created successfully! Share this token with the invitee:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-background px-3 py-2 text-xs text-foreground font-mono break-all border border-border">
                {createdToken}
              </code>
              <button
                type="button"
                onClick={handleCopyToken}
                className="flex items-center gap-1 rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Revoke error */}
      {revokeError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">{revokeError}</p>
          </div>
        </div>
      )}

      {/* Pending Invites */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-sm font-medium text-foreground">
            Pending Invites ({pendingInvites.length})
          </h2>
          <button
            type="button"
            onClick={fetchInvites}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh invites"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>

        {pendingInvites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Mail className="mb-2 h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No pending invites.</p>
          </div>
        ) : (
          <div>
            {pendingInvites.map((invite) => (
              <div
                key={invite.invite_id}
                className="flex items-center justify-between border-b border-border px-6 py-3 last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {invite.invited_email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Role: {invite.role} &middot; Expires: {formatDate(invite.expires_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full border px-2 py-0.5 text-xs font-medium',
                      statusBadgeStyles.Pending,
                    )}
                  >
                    Pending
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRevoke(invite.invite_id)}
                    title="Revoke invite"
                    className="flex items-center gap-1 rounded-md border border-destructive/50 px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <XCircle className="h-3 w-3" />
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite History */}
      {historyInvites.length > 0 && (
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-sm font-medium text-foreground">
              Invite History ({historyInvites.length})
            </h2>
          </div>

          <div>
            {historyInvites.map((invite) => {
              const effectiveStatus = isExpired(invite) ? 'Expired' : invite.status

              return (
                <div
                  key={invite.invite_id}
                  className="flex items-center justify-between border-b border-border px-6 py-3 last:border-b-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {invite.invited_email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Role: {invite.role} &middot; Created: {formatDate(invite.created_at)}
                      {invite.accepted_at && ` · Accepted: ${formatDate(invite.accepted_at)}`}
                      {invite.revoked_at && ` · Revoked: ${formatDate(invite.revoked_at)}`}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'inline-flex rounded-full border px-2 py-0.5 text-xs font-medium',
                      statusBadgeStyles[effectiveStatus] ?? statusBadgeStyles.Expired,
                    )}
                  >
                    {effectiveStatus}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
