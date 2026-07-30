import type { ReactNode } from 'react'
import { useDensity } from './theme'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { cardPad } = useDensity()
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${cardPad} ${className}`}>
      {children}
    </div>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-[color:var(--accent)]">
      {children}
    </h2>
  )
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </div>
  )
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  at_risk: { label: 'At Risk', className: 'bg-rose-100 text-rose-700' },
  needs_attention: { label: 'Needs Attention', className: 'bg-amber-100 text-amber-800' },
  optimal: { label: 'Optimal', className: 'bg-emerald-100 text-emerald-700' },
}

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? { label: status, className: 'bg-slate-100 text-slate-600' }
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${style.className}`}
    >
      {style.label}
    </span>
  )
}

const RELEVANCY_STYLES: Record<string, string> = {
  high: 'bg-slate-800 text-white',
  medium: 'bg-slate-200 text-slate-700',
  low: 'bg-slate-100 text-slate-500',
}

export function RelevancyPill({ relevancy }: { relevancy: string }) {
  const cls = RELEVANCY_STYLES[relevancy] ?? 'bg-slate-100 text-slate-500'
  const label = relevancy ? relevancy.charAt(0).toUpperCase() + relevancy.slice(1) : '—'
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      {label}
    </span>
  )
}

const KIND_LABELS: Record<string, string> = {
  medication: 'Medication',
  supplement: 'Supplement',
  lifestyle: 'Lifestyle',
  diet: 'Diet',
  testing: 'Testing',
  referral: 'Referral',
}

export function KindChip({ kind }: { kind: string }) {
  return (
    <span className="inline-block rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
      {KIND_LABELS[kind] ?? kind}
    </span>
  )
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
      {children}
    </span>
  )
}
