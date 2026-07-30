import { useNavigate } from 'react-router-dom'
import { useClinics } from '../lib/api'
import { getClinicSlug, setClinic } from '../lib/clinic'

export function ClinicSwitcherPage() {
  const { data: clinics, isLoading, error } = useClinics()
  const navigate = useNavigate()
  const current = getClinicSlug()

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Choose your clinic</h1>
      <p className="mt-1 text-sm text-slate-500">
        This stands in for signing in — everything you see afterwards is scoped to the picked
        clinic.
      </p>
      {isLoading && <div className="mt-8 text-sm text-slate-400">Loading clinics…</div>}
      {error && (
        <div className="mt-8 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Could not load clinics. Is the API running on port 3001? (pnpm dev)
        </div>
      )}
      <div className="mt-8 space-y-3">
        {clinics?.map((clinic) => (
          <button
            key={clinic.id}
            onClick={() => {
              setClinic(clinic.slug, clinic.name)
              navigate('/patients')
            }}
            className={`flex w-full items-center justify-between rounded-xl border bg-white p-5 text-left shadow-sm transition hover:border-blue-400 hover:shadow ${
              current === clinic.slug ? 'border-blue-400 ring-1 ring-blue-400' : 'border-slate-200'
            }`}
          >
            <div>
              <div className="font-semibold text-slate-900">{clinic.name}</div>
              <div className="text-xs text-slate-400">{clinic.slug}</div>
            </div>
            {current === clinic.slug && (
              <span className="text-xs font-medium text-blue-600">Current</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
