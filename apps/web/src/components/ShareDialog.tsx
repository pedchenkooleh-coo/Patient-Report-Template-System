import { useState } from 'react'
import type { TemplateSummaryDto } from '@app/shared'
import { useCreateShare, usePatientShares, useRevokeShare } from '../lib/api'
import { Modal } from './Modal'

/** Create and manage public read-only share links for a patient's report. */
export function ShareDialog({
  patientId,
  templates,
  onClose,
}: {
  patientId: string
  templates: TemplateSummaryDto[]
  onClose: () => void
}) {
  const { data: shares } = usePatientShares(patientId)
  const create = useCreateShare(patientId)
  const revoke = useRevokeShare(patientId)

  const [templateId, setTemplateId] = useState('')
  const [expires, setExpires] = useState('') // '', '7', '30'
  const [copied, setCopied] = useState<string | null>(null)

  const shareUrl = (token: string) => `${window.location.origin}/share/${token}`

  const copy = (token: string) => {
    void navigator.clipboard?.writeText(shareUrl(token))
    setCopied(token)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <Modal title="Share this report" onClose={onClose} wide>
      <p className="text-sm text-slate-600">
        Generate an unguessable read-only link a patient can open without signing in. The link pins
        the chosen template and can expire automatically.
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-2 rounded-lg border border-slate-200 p-3">
        <label className="text-sm text-slate-700">
          Template
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="mt-1 block rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
          >
            <option value="">Patient's effective template</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-slate-700">
          Expires
          <select
            value={expires}
            onChange={(e) => setExpires(e.target.value)}
            className="mt-1 block rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
          >
            <option value="">Never</option>
            <option value="7">In 7 days</option>
            <option value="30">In 30 days</option>
          </select>
        </label>
        <button
          onClick={() =>
            create.mutate({
              templateId: templateId || null,
              expiresInDays: expires ? parseInt(expires, 10) : null,
            })
          }
          disabled={create.isPending}
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
        >
          Create link
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {shares?.length === 0 && <div className="text-sm text-slate-400">No links yet.</div>}
        {shares?.map((s) => (
          <div key={s.id} className="flex items-center gap-2 rounded-md border border-slate-200 p-2 text-sm">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                s.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {s.active ? 'Active' : s.revokedAt ? 'Revoked' : 'Expired'}
            </span>
            <code className="flex-1 truncate text-xs text-slate-500">{shareUrl(s.token)}</code>
            {s.expiresAt && (
              <span className="text-[11px] text-slate-400">
                exp {new Date(s.expiresAt).toLocaleDateString()}
              </span>
            )}
            <button
              onClick={() => copy(s.token)}
              className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              {copied === s.token ? 'Copied ✓' : 'Copy'}
            </button>
            {s.active && (
              <button
                onClick={() => revoke.mutate(s.id)}
                className="rounded border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
              >
                Revoke
              </button>
            )}
          </div>
        ))}
      </div>
    </Modal>
  )
}
