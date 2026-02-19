import { useState } from 'react'
import { updateProfile } from 'firebase/auth'
import { auth } from '@/lib/auth'
import { useAuthStore } from '@/stores/authStore'
import { User, Save } from 'lucide-react'
import { cn } from '@/lib/cn'

export default function ProfileSection(): JSX.Element {
  const user = useAuthStore((s) => s.user)
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isDirty = displayName.trim() !== (user?.displayName ?? '')

  async function handleSave(): Promise<void> {
    if (!auth.currentUser) return
    const trimmed = displayName.trim()
    if (!trimmed) {
      setError('Display name cannot be empty')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      await updateProfile(auth.currentUser, { displayName: trimmed })
      // Force store update so the UI reflects the new name
      useAuthStore.getState().setUser(auth.currentUser)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  /**
   * Derive initials from display name or email for the avatar fallback.
   */
  function getInitials(): string {
    const name = user?.displayName || user?.email || '?'
    const parts = name.split(/[\s@]+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your display name and profile information.
        </p>
      </div>

      {/* Avatar section */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-medium text-foreground">Avatar</h2>
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile avatar"
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              {getInitials()}
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">
              Avatar upload will be available in a future update.
            </p>
          </div>
        </div>
      </div>

      {/* Profile details */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-medium text-foreground">Profile Details</h2>

        <div className="space-y-4">
          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-foreground">
              Display Name
            </label>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value)
                  setError(null)
                  setSuccess(false)
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter your display name"
                maxLength={100}
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={user?.email ?? ''}
              readOnly
              className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Email changes are not supported at this time.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mt-4 rounded-md border border-green-500/50 bg-green-500/10 px-4 py-3">
            <p className="text-sm text-green-500">Profile updated successfully.</p>
          </div>
        )}

        {/* Save button */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className={cn(
              'flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors',
              (saving || !isDirty) && 'opacity-50 cursor-not-allowed',
            )}
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
