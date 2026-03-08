import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App error:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="flex min-h-screen items-center justify-center p-4"
          style={{ background: 'var(--orb-bg, #f1f5f9)' }}
        >
          <div className="max-w-md rounded-2xl border border-red-300 bg-white p-4 shadow-lg dark:border-red-700 dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              {this.state.error.message}
            </p>
            <pre className="mt-3 max-h-40 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
              {this.state.error.stack}
            </pre>
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="mt-3 rounded-lg bg-gray-200 px-3 py-1.5 text-sm dark:bg-gray-700"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
