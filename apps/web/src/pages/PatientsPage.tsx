import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { SEX_VALUES, type PatientDto } from '@app/shared'
import { useCreatePatient, useDeletePatient, usePatients, useTemplates, useUpdatePatient } from '../lib/api'
import { Modal } from '../components/Modal'

export function PatientsPage() {
  const { data: patients, isLoading } = usePatients()
  const { data: templates } = useTemplates()
  const deletePatient = useDeletePatient()

  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<PatientDto | 'new' | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (patients ?? []).filter((p) => !q || p.name.toLowerCase().includes(q))
  }, [patients, query])

  const templateName = (tid: string | null) =>
    tid ? (templates?.find((t) => t.id === tid)?.name ?? 'Unknown template') : 'Clinic default'

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Patients</h1>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients…"
            className="w-52 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          />
          <button
            onClick={() => setEditing('new')}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            + New patient
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Sex</th>
              <th className="px-4 py-3">Age</th>
              <th className="px-4 py-3">Template</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-slate-400">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-slate-400">
                  No patients{query ? ' match your search' : ' yet'}.
                </td>
              </tr>
            )}
            {filtered.map((patient) => (
              <tr key={patient.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-800">{patient.name}</td>
                <td className="px-4 py-3 capitalize text-slate-500">{patient.sex}</td>
                <td className="px-4 py-3 text-slate-500">{patient.age}</td>
                <td className="px-4 py-3 text-slate-500">
                  <span
                    className={
                      patient.templateId ? 'font-medium text-slate-700' : 'text-slate-400'
                    }
                  >
                    {templateName(patient.templateId)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    {patient.hasReport ? (
                      <Link
                        to={`/patients/${patient.id}/report`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Report →
                      </Link>
                    ) : (
                      <Link
                        to={`/patients/${patient.id}/report`}
                        className="text-slate-400 hover:underline"
                      >
                        Add report
                      </Link>
                    )}
                    <button
                      onClick={() => setEditing(patient)}
                      className="text-slate-500 hover:text-slate-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${patient.name}? This also deletes their report.`))
                          deletePatient.mutate(patient.id, {
                            onSuccess: () => toast.success(`Deleted ${patient.name}`),
                          })
                      }}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <PatientDialog
          patient={editing === 'new' ? null : editing}
          templates={templates ?? []}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function PatientDialog({
  patient,
  templates,
  onClose,
}: {
  patient: PatientDto | null
  templates: { id: string; name: string; isDefault: boolean }[]
  onClose: () => void
}) {
  const create = useCreatePatient()
  const update = useUpdatePatient()
  const [name, setName] = useState(patient?.name ?? '')
  const [sex, setSex] = useState<(typeof SEX_VALUES)[number]>(
    (patient?.sex as (typeof SEX_VALUES)[number]) ?? 'male',
  )
  const [age, setAge] = useState(patient?.age ?? 40)
  const [templateId, setTemplateId] = useState<string>(patient?.templateId ?? '')

  const pending = create.isPending || update.isPending
  const err = create.error ?? update.error

  const submit = () => {
    if (patient) {
      update.mutate(
        { id: patient.id, body: { name, sex, age, templateId: templateId || null } },
        {
          onSuccess: () => {
            toast.success('Patient updated')
            onClose()
          },
          onError: (e) => toast.error(e.message),
        },
      )
    } else {
      create.mutate(
        { name, sex, age },
        {
          onSuccess: () => {
            toast.success('Patient created')
            onClose()
          },
          onError: (e) => toast.error(e.message),
        },
      )
    }
  }

  return (
    <Modal title={patient ? `Edit ${patient.name}` : 'New patient'} onClose={onClose}>
      <div className="space-y-3">
        <label className="block text-sm text-slate-700">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <div className="flex gap-3">
          <label className="flex-1 text-sm text-slate-700">
            Sex
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value as (typeof SEX_VALUES)[number])}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm capitalize"
            >
              {SEX_VALUES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="w-28 text-sm text-slate-700">
            Age
            <input
              type="number"
              min={0}
              max={130}
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value, 10) || 0)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
        {patient && (
          <label className="block text-sm text-slate-700">
            Report template
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Clinic default</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                  {t.isDefault ? ' (default)' : ''}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-slate-400">
              Assign a specific template to this patient, or fall back to the clinic default.
            </span>
          </label>
        )}
        {err && <div className="text-sm text-rose-600">{err.message}</div>}
        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!name.trim() || pending}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
          >
            {pending ? 'Saving…' : patient ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
