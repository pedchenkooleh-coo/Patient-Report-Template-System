import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ApiRequestError, usePatients, useReport, useTemplates } from '../lib/api'
import { ReportRenderer } from '../renderer/ReportRenderer'
import { ShareDialog } from '../components/ShareDialog'
import { ReportEditorDialog, emptyReport } from '../components/ReportEditorDialog'

const SOURCE_LABEL: Record<string, string> = {
  assigned: 'patient-assigned template',
  default: 'clinic default template',
  override: 'preview override',
  fallback: 'built-in fallback template',
}

export function PatientReportPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const templateId = searchParams.get('templateId') ?? undefined

  const { data, isLoading, error } = useReport(id, templateId)
  const { data: templates } = useTemplates()
  const { data: patients } = usePatients()
  const patient = patients?.find((p) => p.id === id)

  const [showShare, setShowShare] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const noReport = error instanceof ApiRequestError && error.status === 404 && !!patient

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <Link to="/patients" className="text-sm text-slate-500 hover:text-slate-900">
            ← Patients
          </Link>
          <h1 className="text-xl font-bold text-slate-900">
            {data ? `Report — ${data.report.meta.patient.name}` : patient ? `Report — ${patient.name}` : 'Report'}
          </h1>
          {data && (
            <div className="text-xs text-slate-400">
              Rendered via {data.templateName ?? 'default'} ({SOURCE_LABEL[data.source] ?? data.source})
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {data && (
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Template
              <select
                className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
                value={templateId ?? ''}
                onChange={(e) => setSearchParams(e.target.value ? { templateId: e.target.value } : {})}
              >
                <option value="">Effective (assigned / default)</option>
                {templates?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                    {t.isDefault ? ' (default)' : ''}
                  </option>
                ))}
              </select>
            </label>
          )}
          {(data || noReport) && (
            <button
              onClick={() => setShowEdit(true)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {noReport ? 'Add report' : 'Edit report'}
            </button>
          )}
          {data && (
            <>
              <button
                onClick={() => setShowShare(true)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Share
              </button>
              <button
                onClick={() => window.print()}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Print
              </button>
            </>
          )}
        </div>
      </div>

      {isLoading && <div className="text-sm text-slate-400">Loading report…</div>}
      {error && !noReport && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error instanceof Error ? error.message : 'Failed to load report'}
        </div>
      )}
      {noReport && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <div className="text-sm text-slate-500">This patient has no report yet.</div>
          <button
            onClick={() => setShowEdit(true)}
            className="mt-3 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create report
          </button>
        </div>
      )}
      {data && (
        <div className="mx-auto max-w-3xl print:max-w-none">
          <ReportRenderer data={data.report} config={data.template} />
        </div>
      )}

      {showShare && id && (
        <ShareDialog patientId={id} templates={templates ?? []} onClose={() => setShowShare(false)} />
      )}
      {showEdit && id && (
        <ReportEditorDialog
          patientId={id}
          initial={
            data?.report ??
            emptyReport(patient?.name ?? 'New patient', patient?.sex ?? 'male', patient?.age ?? 40)
          }
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  )
}
