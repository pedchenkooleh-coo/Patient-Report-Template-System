import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  MANDATORY_SECTIONS,
  SECTION_TYPES,
  SectionConfigSchema,
  TemplateConfigSchema,
  type SectionConfig,
  type SectionType,
  type TemplateConfig,
  type Theme,
} from '@app/shared'
import {
  ApiRequestError,
  usePatients,
  usePublishTemplate,
  useReport,
  useRestoreVersion,
  useTemplate,
  useUpdateTemplate,
} from '../lib/api'
import { useHistory } from '../lib/useHistory'
import { PanelGroup } from '../components/editor/controls'
import { SectionOptionsForm } from '../components/editor/SectionOptionsForm'
import { ThemePanel } from '../components/editor/ThemePanel'
import { VersionHistory } from '../components/editor/VersionHistory'
import { JsonDialog } from '../components/editor/JsonDialog'
import { Modal } from '../components/Modal'
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

interface Draft {
  name: string
  config: TemplateConfig
}

function uniqueId(base: string, taken: Set<string>): string {
  let id: string = base
  let n = 2
  while (taken.has(id)) id = `${base}-${n++}`
  return id
}

function newSection(type: SectionType, taken: Set<string>): SectionConfig {
  // Parsing through the schema fills in the per-type option defaults.
  return SectionConfigSchema.parse({ id: uniqueId(type, taken), type, enabled: true })
}

export function TemplateEditorPage() {
  const { id } = useParams<{ id: string }>()
  const { data: template, isLoading, error } = useTemplate(id)
  const save = useUpdateTemplate(id ?? '')
  const publish = usePublishTemplate(id ?? '')
  const restore = useRestoreVersion(id ?? '')

  const { state: draft, set: setDraft, reset, undo, redo, canUndo, canRedo } = useHistory<Draft>({
    name: '',
    config: TemplateConfigSchema.parse({ version: 1, theme: { accent: '#2563eb', font: 'sans', density: 'comfortable' }, sections: [] }),
  })

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [addType, setAddType] = useState<SectionType>('custom_text')
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [showJson, setShowJson] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const [publishNote, setPublishNote] = useState('')
  // When previewing a historical version, the right pane renders this instead.
  const [preview, setPreview] = useState<{ version: number; config: TemplateConfig } | null>(null)

  // (Re)load the draft whenever the saved template changes identity/version.
  useEffect(() => {
    if (template) reset({ name: template.name, config: template.config })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.id, template?.version, template?.name])

  const config = draft.config
  const setConfig = (next: TemplateConfig | ((c: TemplateConfig) => TemplateConfig)) =>
    setDraft((d) => ({ ...d, config: typeof next === 'function' ? next(d.config) : next }))
  const setName = (name: string) => setDraft((d) => ({ ...d, name }))
  const setTheme = (patch: Partial<Theme>) =>
    setConfig((c) => ({ ...c, theme: { ...c.theme, ...patch } }))

  // Live validation — surfaced inline; blocks Save/Publish while invalid.
  const validation = useMemo(() => TemplateConfigSchema.safeParse(config), [config])
  const issues = validation.success ? [] : validation.error.issues

  const dirty =
    !!template &&
    (draft.name !== template.name ||
      JSON.stringify(config) !== JSON.stringify(template.config))

  // Preview data: a real seeded report fetched via the clinic default template;
  // the in-editor (unsaved) config is applied client-side.
  const { data: patients } = usePatients()
  const patientsWithReports = useMemo(() => patients?.filter((p) => p.hasReport) ?? [], [patients])
  const [previewPatientId, setPreviewPatientId] = useState<string>('')
  useEffect(() => {
    if (!previewPatientId && patientsWithReports[0]) setPreviewPatientId(patientsWithReports[0].id)
  }, [patientsWithReports, previewPatientId])
  const { data: previewData } = useReport(previewPatientId || undefined)

  // Keyboard undo/redo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z') return
      const el = e.target as HTMLElement
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return
      e.preventDefault()
      e.shiftKey ? redo() : undo()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  if (isLoading) return <div className="text-sm text-slate-400">Loading template…</div>
  if (error || !template) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        {error instanceof Error ? error.message : 'Template not found'}
      </div>
    )
  }

  const taken = new Set(config.sections.map((s) => s.id))

  const updateSection = (sectionId: string, patch: Partial<SectionConfig>) =>
    setConfig((c) => ({
      ...c,
      sections: c.sections.map((s) => (s.id === sectionId ? ({ ...s, ...patch } as SectionConfig) : s)),
    }))

  const updateOptions = (sectionId: string, patch: Record<string, unknown>) =>
    setConfig((c) => ({
      ...c,
      sections: c.sections.map((s) =>
        s.id === sectionId ? ({ ...s, options: { ...s.options, ...patch } } as SectionConfig) : s,
      ),
    }))

  const moveSection = (from: number, to: number) =>
    setConfig((c) => {
      if (to < 0 || to >= c.sections.length || from === to) return c
      const sections = [...c.sections]
      const [moved] = sections.splice(from, 1)
      sections.splice(to, 0, moved!)
      return { ...c, sections }
    })

  const duplicateSection = (index: number) =>
    setConfig((c) => {
      const source = c.sections[index]!
      const takenIds = new Set(c.sections.map((s) => s.id))
      const copy = { ...structuredClone(source), id: uniqueId(source.type, takenIds) } as SectionConfig
      const sections = [...c.sections]
      sections.splice(index + 1, 0, copy)
      return { ...c, sections }
    })

  const addSection = () => {
    const section = newSection(addType, taken)
    setConfig((c) => ({ ...c, sections: [...c.sections, section] }))
    setExpandedId(section.id)
  }

  const removeSection = (sectionId: string) =>
    setConfig((c) => ({ ...c, sections: c.sections.filter((s) => s.id !== sectionId) }))

  const doSave = () => {
    if (!validation.success) return
    save.mutate({ name: draft.name, config })
  }

  const doPublish = () => {
    if (!validation.success) return
    // Publish acts on the saved draft, so persist any pending edits first.
    const run = () =>
      publish.mutate(
        { note: publishNote.trim() || undefined },
        {
          onSuccess: () => {
            setPublishOpen(false)
            setPublishNote('')
          },
        },
      )
    if (dirty) save.mutate({ name: draft.name, config }, { onSuccess: run })
    else run()
  }

  const saveError =
    save.error instanceof ApiRequestError ? save.error : publish.error instanceof ApiRequestError ? publish.error : null

  const previewConfig = preview?.config ?? config

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link to="/templates" className="text-sm text-slate-500 hover:text-slate-900">
          ← Templates
        </Link>
        <input
          value={draft.name}
          onChange={(e) => setName(e.target.value)}
          className="min-w-56 flex-1 rounded-md border border-transparent px-2 py-1 text-lg font-bold text-slate-900 hover:border-slate-300 focus:border-slate-300"
        />
        <StatusPill template={template} dirty={dirty} />
        <div className="flex items-center gap-1">
          <IconBtn label="Undo (⌘Z)" disabled={!canUndo} onClick={undo}>↶</IconBtn>
          <IconBtn label="Redo (⌘⇧Z)" disabled={!canRedo} onClick={redo}>↷</IconBtn>
        </div>
        <button
          onClick={() => setShowJson(true)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          JSON
        </button>
        <button
          onClick={() => reset({ name: template.name, config: template.config })}
          disabled={!dirty}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          Reset
        </button>
        <button
          onClick={doSave}
          disabled={!dirty || !validation.success || save.isPending}
          className="rounded-md border border-blue-600 px-4 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-40"
        >
          {save.isPending ? 'Saving…' : 'Save draft'}
        </button>
        <button
          onClick={() => setPublishOpen(true)}
          disabled={!validation.success || (!dirty && !template.hasUnpublishedChanges)}
          title={
            !dirty && !template.hasUnpublishedChanges ? 'Nothing new to publish' : 'Publish to patient reports'
          }
          className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
        >
          Publish
        </button>
      </div>

      {issues.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <div className="font-medium">This template has {issues.length} validation issue(s):</div>
          {issues.slice(0, 6).map((i, idx) => (
            <div key={idx}>· {i.path.join('.') || '(root)'}: {i.message}</div>
          ))}
        </div>
      )}
      {saveError && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <div className="font-medium">{saveError.message}</div>
          {Array.isArray(saveError.issues) &&
            saveError.issues.map((issue, i) => {
              const m =
                issue && typeof issue === 'object' && 'message' in issue
                  ? String((issue as { message: unknown }).message)
                  : null
              return m ? <div key={i}>· {m}</div> : null
            })}
        </div>
      )}

      <div className="flex flex-col items-start gap-6 lg:flex-row">
        {/* LEFT: controls */}
        <div className="w-full space-y-3 lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)] lg:w-[380px] lg:shrink-0 lg:overflow-y-auto lg:pr-1">
          <ThemePanel theme={config.theme} onChange={setTheme} />

          <PanelGroup title={`Sections (${config.sections.length}) — drag to reorder`}>
            {config.sections.length === 0 && (
              <div className="text-xs text-slate-400">
                No sections yet — add one below to start building this template.
              </div>
            )}
            {config.sections.map((section, index) => {
              const mandatory = MANDATORY_SECTIONS.includes(section.type)
              const expanded = expandedId === section.id
              return (
                <div
                  key={section.id}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex !== null) moveSection(dragIndex, index)
                    setDragIndex(null)
                  }}
                  onDragEnd={() => setDragIndex(null)}
                  className={`rounded-md border ${
                    dragIndex === index ? 'border-blue-400 opacity-60' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 p-2">
                    <span className="cursor-grab select-none px-1 text-slate-300" title="Drag to reorder">
                      ⠿
                    </span>
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
                      onClick={() => duplicateSection(index)}
                      title="Duplicate section"
                      className="px-1 text-xs text-slate-400 hover:text-slate-700"
                    >
                      ⧉
                    </button>
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
                            updateSection(section.id, { title: e.target.value === '' ? undefined : e.target.value })
                          }
                          className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                        />
                      </label>
                      <SectionOptionsForm section={section} onChange={(patch) => updateOptions(section.id, patch)} />
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

          {id && (
            <VersionHistory
              templateId={id}
              previewingVersion={preview?.version ?? null}
              onPreview={(version, cfg) => setPreview(version && cfg ? { version, config: cfg } : null)}
              onRestore={(version) => {
                setPreview(null)
                restore.mutate(version)
              }}
            />
          )}
        </div>

        {/* RIGHT: live preview */}
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
              {preview ? (
                <span className="text-blue-600">Previewing v{preview.version} (read-only)</span>
              ) : (
                <>Live preview {dirty && <span className="text-amber-600">(unsaved changes)</span>}</>
              )}
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
                <ReportRenderer data={previewData.report} config={previewConfig} />
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

      {showJson && (
        <JsonDialog
          config={config}
          onClose={() => setShowJson(false)}
          onImport={(cfg) => setConfig(cfg)}
        />
      )}

      {publishOpen && (
        <Modal title="Publish template" onClose={() => setPublishOpen(false)}>
          <p className="text-sm text-slate-600">
            Publishing makes this the live template for every patient report that uses it. Add an
            optional note for the version history.
          </p>
          <input
            value={publishNote}
            onChange={(e) => setPublishNote(e.target.value)}
            placeholder="What changed? (optional)"
            className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setPublishOpen(false)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={doPublish}
              disabled={publish.isPending || save.isPending}
              className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
            >
              {publish.isPending || save.isPending ? 'Publishing…' : 'Publish now'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function StatusPill({
  template,
  dirty,
}: {
  template: { version: number; publishedVersion: number; isPublished: boolean; hasUnpublishedChanges: boolean }
  dirty: boolean
}) {
  const label = !template.isPublished
    ? 'Draft — never published'
    : dirty || template.hasUnpublishedChanges
      ? `Live v${template.publishedVersion} · unpublished changes`
      : `Published v${template.publishedVersion}`
  const cls = !template.isPublished
    ? 'bg-slate-100 text-slate-600'
    : dirty || template.hasUnpublishedChanges
      ? 'bg-amber-100 text-amber-800'
      : 'bg-emerald-100 text-emerald-700'
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>{label}</span>
}

function IconBtn({
  children,
  label,
  disabled,
  onClick,
}: {
  children: React.ReactNode
  label: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="h-8 w-8 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
    >
      {children}
    </button>
  )
}
