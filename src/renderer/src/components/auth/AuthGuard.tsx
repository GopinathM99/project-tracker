import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { LoadingState } from '@/components/shared/LoadingState'

/**
 * Route guard that redirects unauthenticated users to /login.
 * Shows a loading spinner while Firebase Auth initializes.
 * Renders child routes via <Outlet /> when authenticated.
 */
export function AuthGuard(): JSX.Element {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingState />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
