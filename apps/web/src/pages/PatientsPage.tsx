import { Link } from 'react-router-dom'
import { usePatients } from '../lib/api'

export function PatientsPage() {
  const { data: patients, isLoading } = usePatients()

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Patients</h1>
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Sex</th>
              <th className="px-4 py-3">Age</th>
              <th className="px-4 py-3" />
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
            {patients?.map((patient) => (
              <tr key={patient.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-800">{patient.name}</td>
                <td className="px-4 py-3 capitalize text-slate-500">{patient.sex}</td>
                <td className="px-4 py-3 text-slate-500">{patient.age}</td>
                <td className="px-4 py-3 text-right">
                  {patient.hasReport ? (
                    <Link
                      to={`/patients/${patient.id}/report`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      View report →
                    </Link>
                  ) : (
                    <span className="text-slate-300">No report</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
