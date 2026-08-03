import type { Theme } from '@app/shared'
import { PanelGroup, SelectRow } from './controls'

export function ThemePanel({
  theme,
  onChange,
}: {
  theme: Theme
  onChange: (patch: Partial<Theme>) => void
}) {
  return (
    <PanelGroup title="Theme">
      <ColorRow
        label="Accent color"
        value={theme.accent}
        onChange={(accent) => onChange({ accent })}
      />
      <ColorRow
        label="Secondary accent"
        value={theme.secondaryAccent ?? theme.accent}
        onChange={(secondaryAccent) => onChange({ secondaryAccent })}
        onClear={theme.secondaryAccent ? () => onChange({ secondaryAccent: undefined }) : undefined}
      />
      <SelectRow
        label="Font"
        value={theme.font}
        options={[
          { value: 'sans', label: 'Sans-serif' },
          { value: 'serif', label: 'Serif' },
        ]}
        onChange={(font) => onChange({ font: font as Theme['font'] })}
      />
      <SelectRow
        label="Font size"
        value={theme.fontScale ?? 'normal'}
        options={[
          { value: 'compact', label: 'Small' },
          { value: 'normal', label: 'Normal' },
          { value: 'large', label: 'Large' },
        ]}
        onChange={(fontScale) => onChange({ fontScale: fontScale as Theme['fontScale'] })}
      />
      <SelectRow
        label="Density"
        value={theme.density}
        options={[
          { value: 'comfortable', label: 'Comfortable' },
          { value: 'compact', label: 'Compact' },
        ]}
        onChange={(density) => onChange({ density: density as Theme['density'] })}
      />
      <label className="block text-sm text-slate-700">
        Brand name (optional)
        <input
          value={theme.brandName ?? ''}
          placeholder="e.g. Doron Health"
          onChange={(e) => onChange({ brandName: e.target.value === '' ? undefined : e.target.value })}
          className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
    </PanelGroup>
  )
}

function ColorRow({
  label,
  value,
  onChange,
  onClear,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  onClear?: () => void
}) {
  return (
    <label className="flex items-center justify-between gap-2 text-sm text-slate-700">
      {label}
      <span className="flex items-center gap-2">
        <span className="font-mono text-xs text-slate-400">{value}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-10 cursor-pointer rounded border border-slate-300"
        />
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            title="Clear secondary accent"
            className="text-xs text-slate-400 hover:text-slate-700"
          >
            ✕
          </button>
        )}
      </span>
    </label>
  )
}
