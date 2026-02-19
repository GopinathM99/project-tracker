import { useEffect } from 'react'
import { errorLogger } from '@/lib/error-logger'

/**
 * Installs global error handlers for uncaught exceptions and unhandled promise rejections.
 * NFR-018: Client-side errors logged to monitoring service in production.
 */
export function useGlobalErrorHandlers(): void {
  useEffect(() => {
    function handleError(event: ErrorEvent): void {
      const error = event.error instanceof Error
        ? event.error
        : new Error(event.message || 'Unknown error')

      errorLogger.captureError(error, {
        component: 'global',
        action: 'uncaught-exception',
      })
    }

    function handleUnhandledRejection(event: PromiseRejectionEvent): void {
      const error = event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason ?? 'Unhandled promise rejection'))

      errorLogger.captureError(error, {
        component: 'global',
        action: 'unhandled-rejection',
      })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])
}
