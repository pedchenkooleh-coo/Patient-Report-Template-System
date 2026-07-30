import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useReport, useTemplates } from '../lib/api'
import { ReportRenderer } from '../renderer/ReportRenderer'

export function PatientReportPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const templateId = searchParams.get('templateId') ?? undefined

  const { data, isLoading, error } = useReport(id, templateId)
  const { data: templates } = useTemplates()

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/patients" className="text-sm text-slate-500 hover:text-slate-900">
            ← Patients
          </Link>
          <h1 className="text-xl font-bold text-slate-900">
            {data ? `Report — ${data.report.meta.patient.name}` : 'Report'}
          </h1>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Template
          <select
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
            value={templateId ?? ''}
            onChange={(e) => {
              const value = e.target.value
              setSearchParams(value ? { templateId: value } : {})
            }}
          >
            <option value="">Clinic default</option>
            {templates?.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
                {template.isDefault ? ' (default)' : ''}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading && <div className="text-sm text-slate-400">Loading report…</div>}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error instanceof Error ? error.message : 'Failed to load report'}
        </div>
      )}
      {data && (
        <div className="mx-auto max-w-3xl">
          <ReportRenderer data={data.report} config={data.template} />
        </div>
      )}
    </div>
  )
}
