import { useState } from 'react'
import type { TemplateConfig } from '@app/shared'
import { fetchVersion, useTemplateVersions } from '../../lib/api'
import { PanelGroup } from './controls'

/**
 * Version history with per-row preview (renders that snapshot in the right pane)
 * and restore (loads the snapshot into the editable draft).
 */
export function VersionHistory({
  templateId,
  previewingVersion,
  onPreview,
  onRestore,
}: {
  templateId: string
  previewingVersion: number | null
  onPreview: (version: number | null, config: TemplateConfig | null) => void
  onRestore: (version: number) => void
}) {
  const { data: versions, isLoading } = useTemplateVersions(templateId)
  const [busy, setBusy] = useState<number | null>(null)

  const preview = async (version: number) => {
    if (previewingVersion === version) {
      onPreview(null, null)
      return
    }
    setBusy(version)
    try {
      const detail = await fetchVersion(templateId, version)
      onPreview(version, detail.config)
    } finally {
      setBusy(null)
    }
  }

  return (
    <PanelGroup title="Version history">
      {isLoading && <div className="text-xs text-slate-400">Loading…</div>}
      {versions && versions.length === 0 && (
        <div className="text-xs text-slate-400">No published versions yet. Publish to create one.</div>
      )}
      <div className="space-y-1.5">
        {versions?.map((v) => (
          <div key={v.id} className="rounded-md border border-slate-200 p-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">v{v.version}</span>
              {v.isLive && (
                <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                  Live
                </span>
              )}
              <span className="ml-auto text-[11px] text-slate-400">
                {new Date(v.createdAt).toLocaleDateString()}
              </span>
            </div>
            {v.note && <div className="mt-0.5 text-xs text-slate-500">“{v.note}”</div>}
            <div className="mt-1.5 flex gap-3 text-xs">
              <button
                onClick={() => preview(v.version)}
                disabled={busy === v.version}
                className="font-medium text-blue-600 hover:underline disabled:opacity-50"
              >
                {previewingVersion === v.version ? 'Stop preview' : 'Preview'}
              </button>
              <button
                onClick={() => onRestore(v.version)}
                className="font-medium text-slate-600 hover:underline"
              >
                Restore to draft
              </button>
            </div>
          </div>
        ))}
      </div>
    </PanelGroup>
  )
}
