import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { getClinicName } from '../lib/clinic'

export function Layout({ children }: { children: ReactNode }) {
  const clinicName = getClinicName()
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          <div className="text-sm font-bold tracking-tight text-slate-900">Report Templates</div>
          <nav className="flex items-center gap-1 text-sm">
            {[
              { to: '/patients', label: 'Patients' },
              { to: '/templates', label: 'Templates' },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 font-medium ${
                    isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
              {clinicName ?? 'No clinic'}
            </span>
            <Link to="/" className="text-slate-500 hover:text-slate-900">
              Switch clinic
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}
