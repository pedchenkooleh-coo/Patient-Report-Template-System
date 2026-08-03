import { useState } from 'react'
import { TemplateConfigSchema, type TemplateConfig } from '@app/shared'
import { Modal } from '../Modal'

/**
 * Import/Export a template config as JSON. Export shows the current config;
 * Import validates pasted JSON against the shared schema before applying.
 */
export function JsonDialog({
  config,
  onClose,
  onImport,
}: {
  config: TemplateConfig
  onClose: () => void
  onImport: (config: TemplateConfig) => void
}) {
  const [text, setText] = useState(() => JSON.stringify(config, null, 2))
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const apply = () => {
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      setError('Not valid JSON.')
      return
    }
    const result = TemplateConfigSchema.safeParse(parsed)
    if (!result.success) {
      setError(result.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('\n'))
      return
    }
    onImport(result.data)
    onClose()
  }

  const copy = () => {
    void navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Modal title="Import / Export template JSON" onClose={onClose} wide>
      <p className="mb-2 text-sm text-slate-500">
        Copy this config to move a template between clinics, or paste one in and click Apply to load
        it into the editor (validated before it is applied).
      </p>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setError(null)
        }}
        spellCheck={false}
        rows={16}
        className="w-full rounded-md border border-slate-300 p-2 font-mono text-xs"
      />
      {error && (
        <pre className="mt-2 whitespace-pre-wrap rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
          {error}
        </pre>
      )}
      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={copy}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
        <button
          onClick={apply}
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Apply to editor
        </button>
      </div>
    </Modal>
  )
}
