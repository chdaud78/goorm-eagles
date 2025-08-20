import { Component } from 'react'

export class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen grid place-items-center p-6">
          <div className="max-w-md w-full bg-white shadow rounded-xl p-6">
            <h2 className="text-xl font-bold mb-2">에러가 발생했어요</h2>
            <p className="text-sm text-red-600 whitespace-pre-wrap">{String(this.state.error)}</p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
