import {
  COACH_FIELDS,
  DEEP_DIVE_COLUMNS,
  ORDER_GROUPS,
  type CategoryStatus,
  type SectionConfig,
} from '@app/shared'
import { CheckboxRow, MultiCheckRow, NumberRow, SelectRow } from './controls'

const STATUS_VALUES: readonly CategoryStatus[] = ['at_risk', 'needs_attention', 'optimal']

/**
 * Per-type options form, mapped from the shared discriminated union.
 * `onChange` merges a partial options patch into the section's options.
 */
export function SectionOptionsForm({
  section,
  onChange,
}: {
  section: SectionConfig
  onChange: (patch: Record<string, unknown>) => void
}) {
  switch (section.type) {
    case 'header':
    case 'story':
      return <div className="text-xs text-slate-400">This section has no options.</div>

    case 'health_status':
      return (
        <CheckboxRow
          label="Show author signature"
          checked={section.options.showAuthor !== false}
          onChange={(v) => onChange({ showAuthor: v })}
        />
      )

    case 'goals':
      return (
        <div className="space-y-2">
          <CheckboxRow
            label="Show metrics table"
            checked={section.options.showMetricsTable !== false}
            onChange={(v) => onChange({ showMetricsTable: v })}
          />
          <CheckboxRow
            label="Show timeframe"
            checked={section.options.showTimeframe !== false}
            onChange={(v) => onChange({ showTimeframe: v })}
          />
          <NumberRow
            label="Max goals"
            value={section.options.maxGoals}
            onChange={(v) => onChange({ maxGoals: v })}
          />
        </div>
      )

    case 'plan_summary':
      return (
        <CheckboxRow
          label="Group items by kind"
          checked={section.options.groupByKind !== false}
          onChange={(v) => onChange({ groupByKind: v })}
        />
      )

    case 'orders':
      return (
        <MultiCheckRow
          label="Order groups to show"
          all={ORDER_GROUPS}
          labels={{ labs: 'Labs', referrals: 'Referrals', imaging: 'Imaging' }}
          selected={[...section.options.groups]}
          onChange={(groups) => onChange({ groups })}
        />
      )

    case 'timeline':
      return (
        <div className="space-y-2">
          <SelectRow
            label="Style"
            value={section.options.style}
            options={[
              { value: 'timeline', label: 'Timeline' },
              { value: 'list', label: 'List' },
            ]}
            onChange={(style) => onChange({ style })}
          />
          <NumberRow
            label="Max milestones"
            value={section.options.maxMilestones}
            onChange={(v) => onChange({ maxMilestones: v })}
          />
        </div>
      )

    case 'coach':
      return (
        <div className="space-y-2">
          <MultiCheckRow
            label="Fields to show"
            all={COACH_FIELDS}
            labels={{
              whatToDo: 'What to do',
              whyItMatters: 'Why it matters',
              howItWorks: 'How it works',
              week1Plan: 'Week-1 plan',
              faq: 'FAQ',
              tip: 'Tip',
            }}
            selected={[...section.options.fields]}
            onChange={(fields) => onChange({ fields })}
          />
          <CheckboxRow
            label="Include medication safety"
            checked
            disabled
            note="Required for patient safety — the “call us right away” guidance cannot be hidden."
          />
        </div>
      )

    case 'deep_dive':
      return (
        <div className="space-y-2">
          <CheckboxRow
            label="Only abnormal biomarkers"
            checked={section.options.onlyAbnormal === true}
            onChange={(v) => onChange({ onlyAbnormal: v })}
          />
          <CheckboxRow
            label="Show biomarker tables"
            checked={section.options.showBiomarkerTables !== false}
            onChange={(v) => onChange({ showBiomarkerTables: v })}
          />
          <MultiCheckRow
            label="Table columns"
            all={DEEP_DIVE_COLUMNS}
            labels={{
              relevancy: 'Relevancy',
              value: 'Value',
              referenceRange: 'Reference range',
              optimalRange: 'Optimal range',
              date: 'Date',
            }}
            selected={[...section.options.columns]}
            onChange={(columns) => onChange({ columns })}
          />
          <MultiCheckRow
            label="Category status filter"
            note="Leave all unchecked to show every category."
            all={STATUS_VALUES}
            labels={{ at_risk: 'At risk', needs_attention: 'Needs attention', optimal: 'Optimal' }}
            selected={[...(section.options.statusFilter ?? [])]}
            onChange={(statusFilter) =>
              onChange({ statusFilter: statusFilter.length ? statusFilter : undefined })
            }
          />
        </div>
      )

    case 'custom_text':
      return (
        <label className="block text-sm text-slate-700">
          Markdown text
          <textarea
            value={section.options.markdown}
            onChange={(e) => onChange({ markdown: e.target.value })}
            rows={6}
            placeholder="## About this report&#10;&#10;Clinic branding, disclaimers…"
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
          />
        </label>
      )
  }
}
