import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { workspaceService } from '@/services/workspace-service'
import { memberService } from '@/services/member-service'
import { LoadingState } from '@/components/shared/LoadingState'

/**
 * Route guard that ensures the user has a workspace selected.
 * After auth is confirmed:
 * 1. Queries user's workspaces
 * 2. If user has one or more workspaces, auto-selects the first (or persisted) one
 * 3. If user has no workspaces, redirects to /workspace-setup
 * 4. Loads the workspace and membership into stores
 */
export function WorkspaceGuard(): JSX.Element {
  const user = useAuthStore((s) => s.user)
  const currentWorkspaceId = useAppStore((s) => s.currentWorkspaceId)
  const setCurrentWorkspace = useAppStore((s) => s.setCurrentWorkspace)
  const { setWorkspace, setMembership, setLoading: setWorkspaceLoading } = useWorkspaceStore()
  const [resolving, setResolving] = useState(true)
  const [hasWorkspace, setHasWorkspace] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false

    async function resolveWorkspace(): Promise<void> {
      if (!user) return

      setResolving(true)
      setWorkspaceLoading(true)

      try {
        const workspaces = await workspaceService.getUserWorkspaces()

        if (cancelled) return

        if (workspaces.length === 0) {
          setHasWorkspace(false)
          setResolving(false)
          setWorkspaceLoading(false)
          return
        }

        // Use persisted workspace if still valid, otherwise pick the first one
        const targetWorkspace =
          (currentWorkspaceId && workspaces.find((w) => w.workspace_id === currentWorkspaceId)) ||
          workspaces[0]

        setCurrentWorkspace(targetWorkspace.workspace_id)
        setWorkspace(targetWorkspace)

        // Load the user's membership
        const membership = await memberService.getWorkspaceMembership(
          targetWorkspace.workspace_id,
          user.uid,
        )

        if (cancelled) return

        setMembership(membership)
        setHasWorkspace(true)
      } catch {
        if (!cancelled) {
          setHasWorkspace(false)
        }
      } finally {
        if (!cancelled) {
          setResolving(false)
          setWorkspaceLoading(false)
        }
      }
    }

    resolveWorkspace()

    return () => {
      cancelled = true
    }
  }, [user?.uid])

  if (resolving) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingState />
      </div>
    )
  }

  if (hasWorkspace === false) {
    return <Navigate to="/workspace-setup" replace />
  }

  return <Outlet />
}
