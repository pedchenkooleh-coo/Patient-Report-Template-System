import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import type { PublicReportResponse } from '@app/shared'
import { ReportRenderer } from '../renderer/ReportRenderer'

/**
 * Public, unauthenticated read-only report — reached via a share token.
 * Deliberately does NOT send a clinic header or use the app chrome.
 */
export function SharePage() {
  const { token } = useParams<{ token: string }>()
  const { data, isLoading, error } = useQuery({
    queryKey: ['share', token],
    queryFn: async () => {
      const res = await fetch(`/api/share/${token}`)
      if (!res.ok) throw new Error('This shared report is unavailable, expired, or has been revoked.')
      return (await res.json()) as PublicReportResponse
    },
  })

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white print:hidden">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="text-sm font-semibold text-slate-700">{data?.clinicName ?? 'Patient report'}</div>
          {data && (
            <button
              onClick={() => window.print()}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Print
            </button>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 print:py-0">
        {isLoading && <div className="text-sm text-slate-400">Loading…</div>}
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error instanceof Error ? error.message : 'Unavailable'}
          </div>
        )}
        {data && <ReportRenderer data={data.report} config={data.template} />}
      </main>
    </div>
  )
}
