import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { TemplateSummaryDto } from '@app/shared'
import {
  useCreateTemplate,
  useDeleteTemplate,
  useSetDefaultTemplate,
  useTemplates,
} from '../lib/api'

function StatusBadge({ template }: { template: TemplateSummaryDto }) {
  if (!template.isPublished) {
    return (
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase text-slate-500">
        Draft
      </span>
    )
  }
  if (template.hasUnpublishedChanges) {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold uppercase text-amber-800">
        Unpublished changes
      </span>
    )
  }
  return (
    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold uppercase text-blue-700">
      Published v{template.publishedVersion}
    </span>
  )
}

export function TemplatesPage() {
  const { data: templates, isLoading } = useTemplates()
  const createTemplate = useCreateTemplate()
  const setDefault = useSetDefaultTemplate()
  const deleteTemplate = useDeleteTemplate()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [source, setSource] = useState<'base' | 'blank'>('base')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (templates ?? []).filter((t) => !q || t.name.toLowerCase().includes(q))
  }, [templates, query])

  const create = () => {
    if (!name.trim()) return
    createTemplate.mutate(
      { name: name.trim(), from: source },
      {
        onSuccess: (created) => {
          setName('')
          navigate(`/templates/${created.id}`)
        },
      },
    )
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Templates</h1>
      <p className="mt-1 text-sm text-slate-500">
        Templates control how this clinic's patient reports are rendered. Each clinic owns its
        own set.
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && create()}
            placeholder="e.g. Follow-up visit report"
            className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm font-normal normal-case tracking-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Start from
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as 'base' | 'blank')}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal"
          >
            <option value="base">Base template (all sections)</option>
            <option value="blank">Blank template (no sections)</option>
          </select>
        </label>
        <button
          onClick={create}
          disabled={!name.trim() || createTemplate.isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
        >
          Create template
        </button>
        {createTemplate.error && (
          <div className="text-sm text-rose-600">{createTemplate.error.message}</div>
        )}
      </div>

      <div className="mt-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search templates…"
          className="w-64 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
      </div>

      <div className="mt-4 space-y-3">
        {isLoading && <div className="text-sm text-slate-400">Loading…</div>}
        {!isLoading && filtered.length === 0 && (
          <div className="text-sm text-slate-400">No templates{query ? ' match your search' : ''}.</div>
        )}
        {filtered.map((template) => (
          <div
            key={template.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Link
                  to={`/templates/${template.id}`}
                  className="font-semibold text-slate-800 hover:text-blue-700"
                >
                  {template.name}
                </Link>
                {template.isDefault && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold uppercase text-emerald-700">
                    Default
                  </span>
                )}
                <StatusBadge template={template} />
              </div>
              <div className="text-xs text-slate-400">
                draft v{template.version} · updated {new Date(template.updatedAt).toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Link
                to={`/templates/${template.id}`}
                className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
              >
                Edit
              </Link>
              <button
                onClick={() =>
                  createTemplate.mutate({
                    name: `${template.name} (copy)`,
                    from: { duplicateOf: template.id },
                  })
                }
                className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
              >
                Duplicate
              </button>
              {!template.isDefault && (
                <button
                  onClick={() => setDefault.mutate(template.id)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Set default
                </button>
              )}
              <button
                onClick={() => deleteTemplate.mutate(template.id)}
                disabled={template.isDefault}
                title={
                  template.isDefault
                    ? 'The default template cannot be deleted — set another template as default first.'
                    : 'Delete template'
                }
                className="rounded-md border border-rose-200 px-3 py-1.5 font-medium text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 disabled:hover:bg-white"
              >
                Delete
              </button>
            </div>
            {template.isDefault && (
              <div className="w-full text-xs text-slate-400">
                This is the clinic's default template — it renders every patient report unless a
                preview override is chosen. Set another template as default to delete it.
              </div>
            )}
          </div>
        ))}
      </div>
      {deleteTemplate.error && (
        <div className="mt-3 text-sm text-rose-600">{deleteTemplate.error.message}</div>
      )}
    </div>
  )
}
