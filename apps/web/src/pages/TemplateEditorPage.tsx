import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  MANDATORY_SECTIONS,
  SECTION_TYPES,
  SectionConfigSchema,
  type SectionConfig,
  type SectionType,
  type TemplateConfig,
} from '@app/shared'
import { ApiRequestError, usePatients, useReport, useTemplate, useUpdateTemplate } from '../lib/api'
import { PanelGroup, SelectRow } from '../components/editor/controls'
import { SectionOptionsForm } from '../components/editor/SectionOptionsForm'
import { ReportRenderer } from '../renderer/ReportRenderer'

const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  header: 'Header',
  health_status: 'Health status',
  story: 'Story',
  goals: 'Goals',
  plan_summary: 'Plan summary',
  orders: 'Orders',
  timeline: 'Timeline',
  coach: 'Coach',
  deep_dive: 'Deep dive',
  custom_text: 'Custom text',
}

function newSection(type: SectionType, existingIds: Set<string>): SectionConfig {
  let id: string = type
  let n = 2
  while (existingIds.has(id)) id = `${type}-${n++}`
  // Parsing through the schema fills in the per-type option defaults.
  return SectionConfigSchema.parse({ id, type, enabled: true })
}

export function TemplateEditorPage() {
  const { id } = useParams<{ id: string }>()
  const { data: template, isLoading, error } = useTemplate(id)
  const save = useUpdateTemplate(id ?? '')

  const [name, setName] = useState('')
  const [config, setConfig] = useState<TemplateConfig | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [addType, setAddType] = useState<SectionType>('custom_text')

  // (Re)load the draft whenever the saved template changes.
  useEffect(() => {
    if (template) {
      setName(template.name)
      setConfig(template.config)
    }
  }, [template])

  const dirty =
    !!template &&
    !!config &&
    (name !== template.name || JSON.stringify(config) !== JSON.stringify(template.config))

  // Preview data: a real seeded report fetched via the clinic default template;
  // the in-editor (unsaved) config is applied client-side.
  const { data: patients } = usePatients()
  const patientsWithReports = useMemo(
    () => patients?.filter((p) => p.hasReport) ?? [],
    [patients],
  )
  const [previewPatientId, setPreviewPatientId] = useState<string>('')
  useEffect(() => {
    if (!previewPatientId && patientsWithReports[0]) {
      setPreviewPatientId(patientsWithReports[0].id)
    }
  }, [patientsWithReports, previewPatientId])
  const { data: previewData } = useReport(previewPatientId || undefined)

  if (isLoading) return <div className="text-sm text-slate-400">Loading template…</div>
  if (error || !template || !config) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        {error instanceof Error ? error.message : 'Template not found'}
      </div>
    )
  }

  const existingIds = new Set(config.sections.map((s) => s.id))

  const updateSection = (sectionId: string, patch: Partial<SectionConfig>) => {
    setConfig((c) =>
      c
        ? {
            ...c,
            sections: c.sections.map((s) =>
              s.id === sectionId ? ({ ...s, ...patch } as SectionConfig) : s,
            ),
          }
        : c,
    )
  }

  const updateOptions = (sectionId: string, patch: Record<string, unknown>) => {
    setConfig((c) =>
      c
        ? {
            ...c,
            sections: c.sections.map((s) =>
              s.id === sectionId ? ({ ...s, options: { ...s.options, ...patch } } as SectionConfig) : s,
            ),
          }
        : c,
    )
  }

  const moveSection = (index: number, delta: -1 | 1) => {
    setConfig((c) => {
      if (!c) return c
      const target = index + delta
      if (target < 0 || target >= c.sections.length) return c
      const sections = [...c.sections]
      const [moved] = sections.splice(index, 1)
      sections.splice(target, 0, moved!)
      return { ...c, sections }
    })
  }

  const addSection = () => {
    const section = newSection(addType, existingIds)
    setConfig((c) => (c ? { ...c, sections: [...c.sections, section] } : c))
    setExpandedId(section.id)
  }

  const removeSection = (sectionId: string) => {
    setConfig((c) => (c ? { ...c, sections: c.sections.filter((s) => s.id !== sectionId) } : c))
  }

  const saveError =
    save.error instanceof ApiRequestError
      ? save.error
      : save.error instanceof Error
        ? { message: save.error.message, issues: undefined }
        : null

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link to="/templates" className="text-sm text-slate-500 hover:text-slate-900">
          ← Templates
        </Link>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-w-64 flex-1 rounded-md border border-transparent px-2 py-1 text-lg font-bold text-slate-900 hover:border-slate-300 focus:border-slate-300"
        />
        <span className="text-xs text-slate-400">
          v{template.version}
          {template.isDefault ? ' · default' : ''}
          {dirty ? ' · unsaved changes' : ''}
        </span>
        <button
          onClick={() => {
            setName(template.name)
            setConfig(template.config)
            save.reset()
          }}
          disabled={!dirty}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          Reset
        </button>
        <button
          onClick={() => save.mutate({ name, config })}
          disabled={!dirty || save.isPending}
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
        >
          {save.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>

      {saveError && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <div className="font-medium">Could not save: {saveError.message}</div>
          {Array.isArray(saveError.issues) &&
            saveError.issues.map((issue, i) => {
              const message =
                issue && typeof issue === 'object' && 'message' in issue
                  ? String((issue as { message: unknown }).message)
                  : null
              return message ? <div key={i}>· {message}</div> : null
            })}
        </div>
      )}

      <div className="flex flex-col items-start gap-6 lg:flex-row">
        {/* LEFT: controls */}
        <div className="w-full space-y-3 lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)] lg:w-[380px] lg:shrink-0 lg:overflow-y-auto lg:pr-1">
          <PanelGroup title="Theme">
            <label className="flex items-center justify-between gap-2 text-sm text-slate-700">
              Accent color
              <span className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.theme.accent}
                  onChange={(e) =>
                    setConfig({ ...config, theme: { ...config.theme, accent: e.target.value } })
                  }
                  className="h-7 w-10 cursor-pointer rounded border border-slate-300"
                />
                <span className="font-mono text-xs text-slate-400">{config.theme.accent}</span>
              </span>
            </label>
            <SelectRow
              label="Font"
              value={config.theme.font}
              options={[
                { value: 'sans', label: 'Sans-serif' },
                { value: 'serif', label: 'Serif' },
              ]}
              onChange={(font) =>
                setConfig({ ...config, theme: { ...config.theme, font: font as 'sans' | 'serif' } })
              }
            />
            <SelectRow
              label="Density"
              value={config.theme.density}
              options={[
                { value: 'comfortable', label: 'Comfortable' },
                { value: 'compact', label: 'Compact' },
              ]}
              onChange={(density) =>
                setConfig({
                  ...config,
                  theme: { ...config.theme, density: density as 'comfortable' | 'compact' },
                })
              }
            />
          </PanelGroup>

          <PanelGroup title={`Sections (${config.sections.length})`}>
            {config.sections.length === 0 && (
              <div className="text-xs text-slate-400">
                No sections yet — add one below to start building this template.
              </div>
            )}
            {config.sections.map((section, index) => {
              const mandatory = MANDATORY_SECTIONS.includes(section.type)
              const expanded = expandedId === section.id
              return (
                <div key={section.id} className="rounded-md border border-slate-200">
                  <div className="flex items-center gap-1.5 p-2">
                    <div className="flex flex-col">
                      <button
                        onClick={() => moveSection(index, -1)}
                        disabled={index === 0}
                        title="Move up"
                        className="px-1 text-[10px] leading-3 text-slate-400 hover:text-slate-800 disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveSection(index, 1)}
                        disabled={index === config.sections.length - 1}
                        title="Move down"
                        className="px-1 text-[10px] leading-3 text-slate-400 hover:text-slate-800 disabled:opacity-30"
                      >
                        ▼
                      </button>
                    </div>
                    <label
                      title={mandatory ? 'The header section is mandatory and cannot be disabled.' : undefined}
                      className={mandatory ? 'cursor-not-allowed' : 'cursor-pointer'}
                    >
                      <input
                        type="checkbox"
                        checked={section.enabled}
                        disabled={mandatory}
                        onChange={(e) => updateSection(section.id, { enabled: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                    </label>
                    <button
                      onClick={() => setExpandedId(expanded ? null : section.id)}
                      className={`flex-1 truncate text-left text-sm font-medium ${
                        section.enabled ? 'text-slate-800' : 'text-slate-400 line-through'
                      }`}
                    >
                      {SECTION_TYPE_LABELS[section.type]}
                      {section.title ? <span className="font-normal text-slate-400"> · “{section.title}”</span> : null}
                    </button>
                    {mandatory && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                        Required
                      </span>
                    )}
                    <button
                      onClick={() => setExpandedId(expanded ? null : section.id)}
                      className="px-1 text-xs text-slate-400"
                    >
                      {expanded ? '▾' : '▸'}
                    </button>
                  </div>
                  {expanded && (
                    <div className="space-y-3 border-t border-slate-100 p-3">
                      <label className="block text-sm text-slate-700">
                        Title override
                        <input
                          value={section.title ?? ''}
                          placeholder="Use default title"
                          onChange={(e) =>
                            updateSection(section.id, {
                              title: e.target.value === '' ? undefined : e.target.value,
                            })
                          }
                          className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                        />
                      </label>
                      <SectionOptionsForm
                        section={section}
                        onChange={(patch) => updateOptions(section.id, patch)}
                      />
                      {!mandatory && (
                        <button
                          onClick={() => removeSection(section.id)}
                          className="text-xs font-medium text-rose-600 hover:underline"
                        >
                          Remove section
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            <div className="flex items-center gap-2 pt-1">
              <select
                value={addType}
                onChange={(e) => setAddType(e.target.value as SectionType)}
                className="flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
              >
                {SECTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {SECTION_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
              <button
                onClick={addSection}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Add section
              </button>
            </div>
          </PanelGroup>
        </div>

        {/* RIGHT: live preview */}
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Live preview {dirty && <span className="text-amber-600">(unsaved changes)</span>}
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Preview patient
              <select
                value={previewPatientId}
                onChange={(e) => setPreviewPatientId(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
              >
                {patientsWithReports.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="rounded-2xl bg-slate-200/60 p-4 sm:p-8">
            <div className="mx-auto max-w-3xl">
              {previewData ? (
                <ReportRenderer data={previewData.report} config={config} />
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
                  {patientsWithReports.length === 0
                    ? 'No seeded patient reports available for preview.'
                    : 'Loading preview…'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
