import type { ReactNode } from 'react'
import {
  useFieldArray,
  useFormContext,
  type FieldArrayPath,
  type FieldPath,
} from 'react-hook-form'
import type { ReportData } from '@app/shared'

/**
 * Thin react-hook-form field wrappers over a `useForm<ReportData>` context.
 * Names are accepted as strings (dynamic array paths like `goals.0.title`) and
 * cast to the typed path — validation is enforced centrally by the zodResolver.
 */
type RD = ReportData
const fp = (name: string) => name as FieldPath<RD>
const ap = (name: string) => name as FieldArrayPath<RD>

function messageAt(errors: unknown, name: string): string | undefined {
  let node: unknown = errors
  for (const key of name.split('.')) {
    if (node && typeof node === 'object') node = (node as Record<string, unknown>)[key]
    else return undefined
  }
  const msg = node && typeof node === 'object' ? (node as { message?: unknown }).message : undefined
  return typeof msg === 'string' ? msg : undefined
}

const inputCls =
  'mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-400 focus:outline-none'

function FieldShell({ label, error, children }: { label?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block text-sm text-slate-700">
      {label && <span className="text-xs font-medium text-slate-500">{label}</span>}
      {children}
      {error && <span className="mt-0.5 block text-xs text-rose-600">{error}</span>}
    </label>
  )
}

export function FormText({ name, label, placeholder }: { name: string; label?: string; placeholder?: string }) {
  const { register, formState } = useFormContext<RD>()
  return (
    <FieldShell label={label} error={messageAt(formState.errors, name)}>
      <input {...register(fp(name))} placeholder={placeholder} className={inputCls} />
    </FieldShell>
  )
}

export function FormArea({ name, label, rows = 3 }: { name: string; label?: string; rows?: number }) {
  const { register, formState } = useFormContext<RD>()
  return (
    <FieldShell label={label} error={messageAt(formState.errors, name)}>
      <textarea {...register(fp(name))} rows={rows} className={inputCls} />
    </FieldShell>
  )
}

export function FormNumber({ name, label }: { name: string; label?: string }) {
  const { register, formState } = useFormContext<RD>()
  return (
    <FieldShell label={label} error={messageAt(formState.errors, name)}>
      <input type="number" {...register(fp(name), { valueAsNumber: true })} className={inputCls} />
    </FieldShell>
  )
}

export function FormSelect({
  name,
  label,
  options,
}: {
  name: string
  label?: string
  options: readonly string[]
}) {
  const { register, formState } = useFormContext<RD>()
  return (
    <FieldShell label={label} error={messageAt(formState.errors, name)}>
      <select {...register(fp(name))} className={`${inputCls} bg-white capitalize`}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o.replace(/_/g, ' ')}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

/** Editor for a `string[]` field (e.g. order labs, goal domains). */
export function StringList({ name, label, placeholder }: { name: string; label?: string; placeholder?: string }) {
  const { control } = useFormContext<RD>()
  const { fields, append, remove } = useFieldArray({ control, name: ap(name) })
  return (
    <div>
      {label && <div className="text-xs font-medium text-slate-500">{label}</div>}
      <div className="mt-1 space-y-1.5">
        {fields.map((field, i) => (
          <div key={field.id} className="flex items-center gap-2">
            <FormTextInline name={`${name}.${i}`} placeholder={placeholder} />
            <RemoveButton onClick={() => remove(i)} />
          </div>
        ))}
      </div>
      {/* string[] items serialize as bare strings, not objects */}
      <AddButton label="Add item" onClick={() => append('' as never)} />
    </div>
  )
}

function FormTextInline({ name, placeholder }: { name: string; placeholder?: string }) {
  const { register } = useFormContext<RD>()
  return <input {...register(fp(name))} placeholder={placeholder} className={`${inputCls} mt-0`} />
}

/** Generic object-array editor with add/remove and a per-item render prop. */
export function Repeater({
  name,
  itemLabel,
  makeEmpty,
  children,
}: {
  name: string
  itemLabel: string
  makeEmpty: () => Record<string, unknown>
  children: (base: string, index: number) => ReactNode
}) {
  const { control } = useFormContext<RD>()
  const { fields, append, remove } = useFieldArray({ control, name: ap(name) })
  return (
    <div className="space-y-2">
      {fields.map((field, i) => (
        <div key={field.id} className="rounded-md border border-slate-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {itemLabel} {i + 1}
            </span>
            <RemoveButton onClick={() => remove(i)} />
          </div>
          <div className="space-y-2">{children(`${name}.${i}`, i)}</div>
        </div>
      ))}
      <AddButton label={`Add ${itemLabel.toLowerCase()}`} onClick={() => append(makeEmpty() as never)} />
    </div>
  )
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 rounded-md border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-400 hover:bg-slate-50"
    >
      + {label}
    </button>
  )
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Remove"
      className="shrink-0 rounded-md border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
    >
      ✕
    </button>
  )
}

export function FormRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2 [&>*]:flex-1">{children}</div>
}
