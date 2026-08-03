import { useState } from 'react'
import { ReportDataSchema, type ReportData } from '@app/shared'
import { useSaveReport } from '../lib/api'
import { Modal } from './Modal'

/**
 * Edit a patient's ReportData as JSON, validated against the shared schema
 * before it is saved. Keeping this as raw domain data (no presentation) mirrors
 * how reports are produced upstream.
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
  const [text, setText] = useState(() => JSON.stringify(initial, null, 2))
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      setError('Not valid JSON.')
      return
    }
    const result = ReportDataSchema.safeParse(parsed)
    if (!result.success) {
      setError(result.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('\n'))
      return
    }
    const data = result.data
    save.mutate(
      { assessmentDate: data.meta.assessmentDate, generatedDate: data.meta.generatedDate, data },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal title="Edit report data" onClose={onClose} wide>
      <p className="mb-2 text-sm text-slate-500">
        This is the raw clinical data (no presentation). It is validated against the ReportData
        schema before saving; how it renders is decided by the template.
      </p>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setError(null)
        }}
        spellCheck={false}
        rows={20}
        className="w-full rounded-md border border-slate-300 p-2 font-mono text-xs"
      />
      {(error || save.error) && (
        <pre className="mt-2 whitespace-pre-wrap rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
          {error ?? save.error?.message}
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
          onClick={submit}
          disabled={save.isPending}
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
        >
          {save.isPending ? 'Saving…' : 'Save report'}
        </button>
      </div>
    </Modal>
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
