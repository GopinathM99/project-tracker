import { useCallback, useEffect, useState } from 'react'
import { memberService } from '@/services/member-service'
import { useWorkspace, useWorkspaceId } from '@/hooks/useWorkspace'
import { useAuthStore } from '@/stores/authStore'
import type { WorkspaceMember } from '@shared/schemas'
import { cn } from '@/lib/cn'
import { Users, RefreshCw, Trash2, AlertTriangle } from 'lucide-react'

type MemberRole = 'Owner' | 'Member' | 'Viewer'

const roleBadgeStyles: Record<MemberRole, string> = {
  Owner: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Member: 'bg-green-500/10 text-green-500 border-green-500/20',
  Viewer: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
}

export default function MembersSection(): JSX.Element {
  const workspaceId = useWorkspaceId()
  const { workspace } = useWorkspace()
  const currentUser = useAuthStore((s) => s.user)

  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // Confirmation dialog state
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  const fetchMembers = useCallback(async () => {
    if (!workspaceId) return
    setLoading(true)
    setError(null)
    try {
      const data = await memberService.getWorkspaceMembers(workspaceId)
      setMembers(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load members'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  /**
   * Count how many owners exist in the current members list.
   */
  function countOwners(): number {
    return members.filter((m) => m.role === 'Owner').length
  }

  async function handleRoleChange(userId: string, newRole: MemberRole): Promise<void> {
    if (!workspaceId) return
    setActionError(null)

    // Prevent demoting the only owner
    const member = members.find((m) => m.user_id === userId)
    if (member?.role === 'Owner' && newRole !== 'Owner' && countOwners() <= 1) {
      setActionError('Cannot change role: this is the only Owner. Promote another member first.')
      return
    }

    try {
      await memberService.updateMemberRole(workspaceId, userId, newRole)
      await fetchMembers()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update role'
      setActionError(message)
    }
  }

  async function handleRemoveMember(userId: string): Promise<void> {
    if (!workspaceId) return
    setActionError(null)
    setConfirmRemove(null)

    try {
      await memberService.removeMember(workspaceId, userId)
      await fetchMembers()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to remove member'
      setActionError(message)
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Members</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage members of {workspace.name}.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchMembers}
          disabled={loading}
          className={cn(
            'flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors',
            loading && 'opacity-50 cursor-not-allowed',
          )}
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Errors */}
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      {actionError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">{actionError}</p>
          </div>
        </div>
      )}

      {/* Members list */}
      {loading && members.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading members...
          </div>
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Users className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No members found.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-border px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>Member</span>
            <span>Role</span>
            <span>Joined</span>
            <span className="text-right">Actions</span>
          </div>

          {members.map((member) => {
            const isSelf = member.user_id === currentUser?.uid
            const isOnlyOwner = member.role === 'Owner' && countOwners() <= 1

            return (
              <div
                key={member.membership_id}
                className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-border px-6 py-4 last:border-b-0"
              >
                {/* Member info */}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {member.user_id}
                    {isSelf && (
                      <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                    )}
                  </p>
                </div>

                {/* Role dropdown */}
                <div>
                  {isSelf || isOnlyOwner ? (
                    <span
                      className={cn(
                        'inline-flex rounded-full border px-2 py-0.5 text-xs font-medium',
                        roleBadgeStyles[member.role as MemberRole],
                      )}
                    >
                      {member.role}
                    </span>
                  ) : (
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleRoleChange(member.user_id, e.target.value as MemberRole)
                      }
                      className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="Owner">Owner</option>
                      <option value="Member">Member</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  )}
                </div>

                {/* Joined date */}
                <div className="text-sm text-muted-foreground">
                  {formatDate(member.created_at)}
                </div>

                {/* Actions */}
                <div className="flex justify-end">
                  {isSelf || isOnlyOwner ? (
                    <span className="w-8" />
                  ) : confirmRemove === member.user_id ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.user_id)}
                        className="rounded-md bg-destructive px-2 py-1 text-xs font-medium text-destructive-foreground hover:bg-destructive/90"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRemove(null)}
                        className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmRemove(member.user_id)}
                      title="Remove member"
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {members.length} active {members.length === 1 ? 'member' : 'members'}
      </p>
    </div>
  )
}
