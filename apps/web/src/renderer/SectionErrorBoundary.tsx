import { Component, type ReactNode } from 'react'

interface Props {
  sectionLabel: string
  children: ReactNode
}

interface State {
  hasError: boolean
}

/** A broken section must never take the whole report down. */
export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error(`Report section "${this.props.sectionLabel}" failed to render:`, error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-400">
          This section could not be displayed.
        </div>
      )
    }
    return this.props.children
  }
}
