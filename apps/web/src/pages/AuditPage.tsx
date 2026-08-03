import { useAudit } from '../lib/api'

const ACTION_STYLES: Record<string, string> = {
  publish: 'bg-emerald-100 text-emerald-700',
  create: 'bg-blue-100 text-blue-700',
  update: 'bg-slate-100 text-slate-600',
  delete: 'bg-rose-100 text-rose-700',
  restore: 'bg-amber-100 text-amber-800',
  setDefault: 'bg-violet-100 text-violet-700',
  revoke: 'bg-rose-100 text-rose-700',
  save: 'bg-slate-100 text-slate-600',
}

function actionStyle(action: string) {
  const verb = action.split('.')[1] ?? action
  return ACTION_STYLES[verb] ?? 'bg-slate-100 text-slate-600'
}

export function AuditPage() {
  const { data: events, isLoading } = useAudit()

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Activity log</h1>
      <p className="mt-1 text-sm text-slate-500">
        Every meaningful change in this clinic — template edits, publishes, patient and report
        updates, and share links.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Detail</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-slate-400">
                  Loading…
                </td>
              </tr>
            )}
            {events?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-slate-400">
                  No activity yet.
                </td>
              </tr>
            )}
            {events?.map((e) => (
              <tr key={e.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${actionStyle(e.action)}`}>
                    {e.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700">{e.summary}</td>
                <td className="px-4 py-3 text-slate-500">{e.actor}</td>
                <td className="px-4 py-3 text-slate-400">{new Date(e.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
