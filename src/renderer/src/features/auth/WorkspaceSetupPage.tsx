import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { workspaceService } from '@/services/workspace-service'
import { memberService } from '@/services/member-service'
import { useAuthStore } from '@/stores/authStore'

export default function WorkspaceSetupPage(): JSX.Element {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const setCurrentWorkspace = useAppStore((s) => s.setCurrentWorkspace)
  const { setWorkspace, setMembership } = useWorkspaceStore()
  const user = useAuthStore((s) => s.user)

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError(null)

    const trimmed = name.trim()
    if (!trimmed) {
      setError('Workspace name is required')
      return
    }

    setLoading(true)

    try {
      const workspace = await workspaceService.createWorkspace(trimmed)
      setCurrentWorkspace(workspace.workspace_id)
      setWorkspace(workspace)

      // Load the owner membership
      if (user) {
        const membership = await memberService.getWorkspaceMembership(
          workspace.workspace_id,
          user.uid,
        )
        setMembership(membership)
      }

      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workspace')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Project Tracker</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create your workspace to get started</p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="workspaceName" className="mb-1 block text-sm font-medium text-foreground">
              Workspace Name
            </label>
            <input
              id="workspaceName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              placeholder="My Team"
              maxLength={200}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              This is the name of your team or organization
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Creating workspace...' : 'Create Workspace'}
          </button>
        </form>
      </div>
    </div>
  )
}
