import type { ReactNode } from 'react'

export function CheckboxRow({
  label,
  checked,
  onChange,
  disabled,
  note,
}: {
  label: string
  checked: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  note?: string
}) {
  return (
    <label
      className={`flex items-start gap-2 text-sm ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300"
      />
      <span>
        <span className="text-slate-700">{label}</span>
        {note && <span className="block text-xs text-slate-400">{note}</span>}
      </span>
    </label>
  )
}

export function NumberRow({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: number | undefined
  onChange: (value: number | undefined) => void
  placeholder?: string
}) {
  return (
    <label className="flex items-center justify-between gap-2 text-sm text-slate-700">
      {label}
      <input
        type="number"
        min={1}
        value={value ?? ''}
        placeholder={placeholder ?? 'all'}
        onChange={(e) => {
          const parsed = parseInt(e.target.value, 10)
          onChange(Number.isNaN(parsed) || parsed < 1 ? undefined : parsed)
        }}
        className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
      />
    </label>
  )
}

export function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}) {
  return (
    <label className="flex items-center justify-between gap-2 text-sm text-slate-700">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}

/** Multi-select as a checkbox group; keeps the underlying array's item order stable. */
export function MultiCheckRow<T extends string>({
  label,
  all,
  labels,
  selected,
  onChange,
  note,
}: {
  label: string
  all: readonly T[]
  labels?: Partial<Record<T, string>>
  selected: T[]
  onChange: (selected: T[]) => void
  note?: string
}) {
  const toggle = (item: T, on: boolean) => {
    onChange(on ? [...all.filter((x) => selected.includes(x) || x === item)] : selected.filter((x) => x !== item))
  }
  return (
    <div className="text-sm">
      <div className="text-slate-700">{label}</div>
      {note && <div className="text-xs text-slate-400">{note}</div>}
      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
        {all.map((item) => (
          <label key={item} className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={selected.includes(item)}
              onChange={(e) => toggle(item, e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300"
            />
            {labels?.[item] ?? item}
          </label>
        ))}
      </div>
    </div>
  )
}

export function PanelGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}
