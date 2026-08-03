import { useState } from 'react'
import { toast } from 'sonner'
import { ReportDataSchema, type ReportData } from '@app/shared'
import { useSaveReport } from '../lib/api'
import { Modal } from './Modal'
import { ReportForm } from './form/ReportForm'

/**
 * Edit a patient's ReportData. Default is a schema-driven structured form
 * (react-hook-form + zodResolver); an "advanced" tab exposes the raw JSON for
 * power users / bulk paste. Both validate against the same ReportData schema.
 */
export function ReportEditorDialog({
  patientId,
  initial,
  onClose,
}: {
  patientId: string
  initial: ReportData
  onClose: () => void
}) {
  const save = useSaveReport(patientId)
  const [mode, setMode] = useState<'form' | 'json'>('form')
  const [text, setText] = useState(() => JSON.stringify(initial, null, 2))
  const [jsonError, setJsonError] = useState<string | null>(null)

  const persist = (data: ReportData) =>
    save.mutate(
      { assessmentDate: data.meta.assessmentDate, generatedDate: data.meta.generatedDate, data },
      {
        onSuccess: () => {
          toast.success('Report saved')
          onClose()
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Save failed'),
      },
    )

  const submitJson = () => {
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      setJsonError('Not valid JSON.')
      return
    }
    const result = ReportDataSchema.safeParse(parsed)
    if (!result.success) {
      setJsonError(result.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('\n'))
      return
    }
    persist(result.data)
  }

  return (
    <Modal title="Edit report data" onClose={onClose} wide>
      <div className="mb-3 flex items-center gap-2">
        <TabButton active={mode === 'form'} onClick={() => setMode('form')}>
          Form
        </TabButton>
        <TabButton active={mode === 'json'} onClick={() => setMode('json')}>
          Advanced JSON
        </TabButton>
        <span className="ml-auto text-xs text-slate-400">Validated against the ReportData schema</span>
      </div>

      {mode === 'form' ? (
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <ReportForm initial={initial} saving={save.isPending} onSubmit={persist} onCancel={onClose} />
        </div>
      ) : (
        <div>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setJsonError(null)
            }}
            spellCheck={false}
            rows={20}
            className="w-full rounded-md border border-slate-300 p-2 font-mono text-xs"
          />
          {(jsonError || save.error) && (
            <pre className="mt-2 whitespace-pre-wrap rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
              {jsonError ?? save.error?.message}
            </pre>
          )}
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={submitJson}
              disabled={save.isPending}
              className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
            >
              {save.isPending ? 'Saving…' : 'Save report'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm font-medium ${
        active ? 'bg-slate-800 text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  )
}

/** A minimal valid ReportData skeleton for creating a brand-new report. */
export function emptyReport(name: string, sex: string, age: number): ReportData {
  const today = new Date().toISOString().slice(0, 10)
  const validSex = sex === 'female' || sex === 'other' ? sex : 'male'
  return {
    meta: {
      patient: { name, sex: validSex, age },
      preparedBy: '',
      assessmentDate: today,
      generatedDate: today,
    },
    healthStatus: { narrative: '', authorName: '' },
    story: [],
    goals: [],
    plan: { items: [] },
    orders: { labs: [], referrals: [], imaging: [] },
    timeline: [],
    coach: [],
    deepDive: [],
  }
}
