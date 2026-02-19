import { Component, type ErrorInfo, type ReactNode } from 'react'
import { errorLogger } from '@/lib/error-logger'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, _info: ErrorInfo): void {
    errorLogger.captureError(error, { component: 'ErrorBoundary', action: 'render' })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-background p-8">
          <div className="max-w-md text-center">
            <h1 className="mb-2 text-xl font-semibold text-foreground">Something went wrong</h1>
            <p className="mb-4 text-sm text-muted-foreground">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
            >
              Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
