/**
 * Centralized error logging service.
 * NFR-018: Client-side errors must be logged to a monitoring service in production.
 *
 * In development: logs to console.
 * In production: can be replaced with Sentry or similar service.
 *
 * Usage: import { errorLogger } from '@/lib/error-logger'
 */

interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  workspaceId?: string
  [key: string]: unknown
}

interface Breadcrumb {
  message: string
  category: string
  timestamp: string
}

class ErrorLogger {
  private breadcrumbs: Breadcrumb[] = []
  private maxBreadcrumbs = 50
  private isProduction = import.meta.env.PROD

  /** Add a breadcrumb for context trail */
  addBreadcrumb(message: string, category: string = 'default'): void {
    this.breadcrumbs.push({
      message,
      category,
      timestamp: new Date().toISOString(),
    })
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs)
    }
  }

  /** Log an error with optional context */
  captureError(error: Error, context?: ErrorContext): void {
    const payload = {
      message: error.message,
      stack: error.stack,
      context,
      breadcrumbs: [...this.breadcrumbs],
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    if (this.isProduction) {
      // In production, this would send to Sentry/monitoring service
      // For now, store in a buffer that could be flushed to a service
      console.error('[ErrorLogger]', payload)
    } else {
      console.error('[ErrorLogger:dev]', error.message, context)
    }
  }

  /** Log a warning */
  captureWarning(message: string, context?: ErrorContext): void {
    if (this.isProduction) {
      console.warn('[ErrorLogger]', message, context)
    } else {
      console.warn('[ErrorLogger:dev]', message, context)
    }
  }
}

export const errorLogger = new ErrorLogger()
