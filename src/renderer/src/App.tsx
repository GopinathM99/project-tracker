import { HashRouter } from 'react-router-dom'
import { AppRoutes } from './routes'
import { ErrorBoundary } from './components/shared/ErrorBoundary'
import { useGlobalErrorHandlers } from '@/hooks/useGlobalErrorHandlers'
// Import auth module to initialize the onAuthStateChanged listener on app load
import '@/lib/auth'

export function App(): JSX.Element {
  useGlobalErrorHandlers()

  return (
    <ErrorBoundary>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </ErrorBoundary>
  )
}
