import {
  CoachOptionsSchema,
  DeepDiveOptionsSchema,
  GoalsOptionsSchema,
  HealthStatusOptionsSchema,
  OrdersOptionsSchema,
  PlanSummaryOptionsSchema,
  TimelineOptionsSchema,
  CustomTextOptionsSchema,
  type Biomarker,
  type CoachEntry,
  type PlanItemKind,
  type ReportData,
} from '@app/shared'
import { Markdown } from './Markdown'
import { Card, Chip, FieldLabel, KindChip, RelevancyPill, SectionTitle, StatusBadge } from './primitives'
import { safeOptions, useDensity } from './theme'

export interface SectionProps {
  data: ReportData
  options: unknown
  title: string
}

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ---- header -----------------------------------------------------------------

export function HeaderSection({ data, title }: SectionProps) {
  const { meta } = data
  const { compact } = useDensity()
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="h-2 bg-[color:var(--accent)]" />
      <div className={compact ? 'p-4' : 'p-6'}>
        {title ? (
          <div className="text-xs font-bold uppercase tracking-widest text-[color:var(--accent)]">
            {title}
          </div>
        ) : null}
        <h1 className={`font-bold text-slate-900 ${compact ? 'text-2xl' : 'text-3xl'} mt-1`}>
          {meta.patient.name}
        </h1>
        <div className="mt-1 text-sm capitalize text-slate-500">
          {meta.patient.sex}, {meta.patient.age} years old
        </div>
        <dl className={`mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3 ${compact ? 'mt-3' : ''}`}>
          <div>
            <FieldLabel>Prepared by</FieldLabel>
            <dd className="mt-0.5 text-slate-700">{meta.preparedBy}</dd>
          </div>
          <div>
            <FieldLabel>Assessment date</FieldLabel>
            <dd className="mt-0.5 text-slate-700">{formatDate(meta.assessmentDate)}</dd>
          </div>
          <div>
            <FieldLabel>Report generated</FieldLabel>
            <dd className="mt-0.5 text-slate-700">{formatDate(meta.generatedDate)}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

// ---- health status ------------------------------------------------------------

export function HealthStatusSection({ data, options, title }: SectionProps) {
  const opts = safeOptions(HealthStatusOptionsSchema, options)
  const { text } = useDensity()
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <Card>
        <p className={`${text} whitespace-pre-line text-slate-700`}>{data.healthStatus.narrative}</p>
        {opts.showAuthor !== false && (
          <div className="mt-3 text-sm font-medium text-slate-500">— {data.healthStatus.authorName}</div>
        )}
      </Card>
    </section>
  )
}

// ---- story ---------------------------------------------------------------------

export function StorySection({ data, title }: SectionProps) {
  const { text, blockGap } = useDensity()
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <Card>
        <div className={blockGap}>
          {data.story.map((entry, i) => (
            <div key={i}>
              <h3 className="font-semibold text-slate-800">{entry.title}</h3>
              <p className={`${text} mt-1 whitespace-pre-line text-slate-600`}>{entry.body}</p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}

// ---- goals ---------------------------------------------------------------------

export function GoalsSection({ data, options, title }: SectionProps) {
  const opts = safeOptions(GoalsOptionsSchema, options)
  const { text, rowPad, blockGap } = useDensity()
  const goals = [...data.goals]
    .sort((a, b) => a.order - b.order)
    .slice(0, typeof opts.maxGoals === 'number' && opts.maxGoals > 0 ? opts.maxGoals : undefined)

  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <div className={blockGap}>
        {goals.map((goal) => (
          <Card key={goal.order}>
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-sm font-bold text-white">
                {goal.order}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-800">{goal.title}</h3>
                <div className="mt-0.5 text-sm text-slate-500">{goal.condition}</div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {goal.domains.map((domain) => (
                    <Chip key={domain}>{domain}</Chip>
                  ))}
                  {opts.showTimeframe && (
                    <span className="text-xs font-medium text-[color:var(--accent)]">
                      Target: {goal.timeframeWeeks} weeks
                    </span>
                  )}
                </div>
                {opts.showMetricsTable && goal.metrics.length > 0 && (
                  <table className={`mt-3 w-full ${text}`}>
                    <thead>
                      <tr className="border-b border-slate-200 text-left">
                        <th className={`${rowPad} pr-2 font-semibold text-slate-500`}>Metric</th>
                        <th className={`${rowPad} pr-2 font-semibold text-slate-500`}>Current</th>
                        <th className={`${rowPad} pr-2 font-semibold text-slate-500`}>Target</th>
                        {opts.showTimeframe && (
                          <th className={`${rowPad} font-semibold text-slate-500`}>Timeframe</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {goal.metrics.map((metric, i) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0">
                          <td className={`${rowPad} pr-2 text-slate-700`}>{metric.name}</td>
                          <td className={`${rowPad} pr-2 font-mono text-[0.95em] tabular-nums text-slate-700`}>
                            {metric.current}
                          </td>
                          <td className={`${rowPad} pr-2 font-mono text-[0.95em] tabular-nums font-medium text-[color:var(--accent)]`}>
                            {metric.target}
                          </td>
                          {opts.showTimeframe && (
                            <td className={`${rowPad} text-slate-500`}>{metric.timeframe}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}

// ---- plan summary ---------------------------------------------------------------

const KIND_ORDER: PlanItemKind[] = ['medication', 'supplement', 'diet', 'lifestyle', 'testing', 'referral']

export function PlanSummarySection({ data, options, title }: SectionProps) {
  const opts = safeOptions(PlanSummaryOptionsSchema, options)
  const { text } = useDensity()
  const items = data.plan.items

  const groups = opts.groupByKind
    ? KIND_ORDER.map((kind) => ({ kind, items: items.filter((i) => i.kind === kind) })).filter(
        (g) => g.items.length > 0,
      )
    : [{ kind: null, items }]

  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {groups.map((group, gi) => (
            <div key={gi}>
              {group.kind && (
                <div className="mb-1.5">
                  <KindChip kind={group.kind} />
                </div>
              )}
              <ul className={`${text} space-y-1 text-slate-700`}>
                {group.items.map((item) => (
                  <li key={item.id} className="flex items-baseline gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 translate-y-[-1px] rounded-full bg-[color:var(--accent)]" />
                    {item.title}
                    {!group.kind && <KindChip kind={item.kind} />}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}

// ---- orders ----------------------------------------------------------------------

const ORDER_GROUP_LABELS: Record<string, string> = {
  labs: 'Laboratory tests',
  referrals: 'Referrals',
  imaging: 'Imaging',
}

export function OrdersSection({ data, options, title }: SectionProps) {
  const opts = safeOptions(OrdersOptionsSchema, options)
  const { text, blockGap } = useDensity()
  const groups = opts.groups
    .map((key) => ({ key, items: data.orders[key] ?? [] }))
    .filter((g) => g.items.length > 0)

  if (groups.length === 0) return null

  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <Card>
        <div className={blockGap}>
          {groups.map((group) => (
            <div key={group.key}>
              <FieldLabel>{ORDER_GROUP_LABELS[group.key] ?? group.key}</FieldLabel>
              <ul className={`${text} mt-1.5 space-y-1 text-slate-700`}>
                {group.items.map((item, i) => (
                  <li key={i} className="flex items-baseline gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 translate-y-[-1px] rounded-full bg-[color:var(--accent)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}

// ---- timeline --------------------------------------------------------------------

export function TimelineSection({ data, options, title }: SectionProps) {
  const opts = safeOptions(TimelineOptionsSchema, options)
  const { text, compact } = useDensity()
  const milestones = data.timeline.slice(
    0,
    typeof opts.maxMilestones === 'number' && opts.maxMilestones > 0 ? opts.maxMilestones : undefined,
  )

  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <Card>
        {opts.style === 'list' ? (
          <div className={compact ? 'space-y-3' : 'space-y-4'}>
            {milestones.map((milestone, i) => (
              <div key={i}>
                <div className="text-sm font-bold text-[color:var(--accent)]">{milestone.offsetLabel}</div>
                <ul className={`${text} mt-1 space-y-1 text-slate-700`}>
                  {milestone.entries.map((entry, j) => (
                    <li key={j} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <KindChip kind={entry.kind} />
                      <span>{entry.action}</span>
                      <span className="text-xs text-slate-400">({entry.planItemTitle})</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative pl-6">
            <div className="absolute bottom-1 left-[5px] top-1.5 w-px bg-slate-200" />
            <div className={compact ? 'space-y-4' : 'space-y-6'}>
              {milestones.map((milestone, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-6 top-1 h-[11px] w-[11px] rounded-full border-2 border-white bg-[color:var(--accent)] ring-1 ring-[color:var(--accent)]" />
                  <div className="text-sm font-bold text-[color:var(--accent)]">
                    {milestone.offsetLabel}
                  </div>
                  <ul className={`${text} mt-1.5 space-y-1.5 text-slate-700`}>
                    {milestone.entries.map((entry, j) => (
                      <li key={j} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <KindChip kind={entry.kind} />
                        <span>{entry.action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </section>
  )
}

// ---- coach ----------------------------------------------------------------------

const COACH_FIELD_LABELS: Record<string, string> = {
  whatToDo: 'What to do',
  whyItMatters: 'Why it matters',
  howItWorks: 'How it works',
  week1Plan: 'Your first week',
}

function CoachSafetyBlock({ safety }: { safety: NonNullable<CoachEntry['safety']> }) {
  const { text } = useDensity()
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
      <div className="text-[11px] font-bold uppercase tracking-wide text-rose-800">
        Important safety information
      </div>
      <dl className={`${text} mt-2 space-y-1.5 text-rose-900`}>
        <div>
          <span className="font-semibold">Avoid: </span>
          {safety.avoid}
        </div>
        <div>
          <span className="font-semibold">Monitoring: </span>
          {safety.monitoring}
        </div>
        <div>
          <span className="font-semibold">Dosing: </span>
          {safety.dosing}
        </div>
      </dl>
      <div className={`${text} mt-2 rounded-md border border-rose-300 bg-rose-100 p-2 font-semibold text-rose-900`}>
        {safety.callUs}
      </div>
    </div>
  )
}

export function CoachSection({ data, options, title }: SectionProps) {
  const opts = safeOptions(CoachOptionsSchema, options)
  const { text, blockGap } = useDensity()
  const fields = new Set(opts.fields)

  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <div className={blockGap}>
        {data.coach.map((entry) => (
          <Card key={entry.planItemId}>
            <h3 className="font-semibold text-slate-800">{entry.title}</h3>
            <div className="mt-3 space-y-3">
              {(['whatToDo', 'whyItMatters', 'howItWorks', 'week1Plan'] as const)
                .filter((field) => fields.has(field) && entry[field])
                .map((field) => (
                  <div key={field}>
                    <FieldLabel>{COACH_FIELD_LABELS[field]}</FieldLabel>
                    <p className={`${text} mt-0.5 text-slate-700`}>{entry[field]}</p>
                  </div>
                ))}

              {entry.eatAvoid && fields.has('whatToDo') && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-emerald-50 p-3">
                    <FieldLabel>Eat more of</FieldLabel>
                    <ul className={`${text} mt-1 list-disc pl-4 text-slate-700`}>
                      {entry.eatAvoid.eat.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg bg-rose-50 p-3">
                    <FieldLabel>Cut back on</FieldLabel>
                    <ul className={`${text} mt-1 list-disc pl-4 text-slate-700`}>
                      {entry.eatAvoid.avoid.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {fields.has('faq') && entry.faq.length > 0 && (
                <div>
                  <FieldLabel>Common questions</FieldLabel>
                  <div className="mt-1 space-y-2">
                    {entry.faq.map((item, i) => (
                      <div key={i} className={text}>
                        <div className="font-medium text-slate-800">{item.q}</div>
                        <div className="text-slate-600">{item.a}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {fields.has('tip') && entry.tip && (
                <div className={`${text} rounded-lg bg-slate-50 p-3 text-slate-700`}>
                  <span className="font-bold text-[color:var(--accent)]">Tip: </span>
                  {entry.tip}
                </div>
              )}

              {/* Patient safety: the schema rejects configs that turn this off
                  for an enabled coach section; default to shown if missing. */}
              {entry.safety && opts.includeSafety !== false && (
                <CoachSafetyBlock safety={entry.safety} />
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}

// ---- deep dive --------------------------------------------------------------------

const DEEP_DIVE_COLUMN_LABELS: Record<string, string> = {
  relevancy: 'Relevancy',
  value: 'Value',
  referenceRange: 'Reference range',
  optimalRange: 'Optimal range',
  date: 'Date',
}

function BiomarkerCell({ column, biomarker }: { column: string; biomarker: Biomarker }) {
  const abnormal = biomarker.flag === 'abnormal'
  switch (column) {
    case 'relevancy':
      return <RelevancyPill relevancy={biomarker.relevancy} />
    case 'value':
      return (
        <span
          className={`font-mono text-[0.95em] tabular-nums ${
            abnormal ? 'font-bold text-rose-600' : 'text-slate-700'
          }`}
        >
          {biomarker.value} <span className="text-[0.85em] font-normal text-slate-400">{biomarker.unit}</span>
        </span>
      )
    case 'referenceRange':
      return <span className="font-mono text-[0.95em] tabular-nums text-slate-500">{biomarker.referenceRange}</span>
    case 'optimalRange':
      return <span className="font-mono text-[0.95em] tabular-nums text-slate-500">{biomarker.optimalRange}</span>
    case 'date':
      return <span className="text-slate-500">{biomarker.date}</span>
    default:
      return null
  }
}

export function DeepDiveSection({ data, options, title }: SectionProps) {
  const opts = safeOptions(DeepDiveOptionsSchema, options)
  const { text, rowPad, blockGap } = useDensity()

  // Ignore unknown column keys from newer clients rather than crashing.
  const columns = opts.columns.filter((c) => c in DEEP_DIVE_COLUMN_LABELS)

  const categories = data.deepDive.filter(
    (category) =>
      !opts.statusFilter || opts.statusFilter.length === 0 || opts.statusFilter.includes(category.status),
  )

  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <div className={blockGap}>
        {categories.map((category) => {
          const biomarkers = opts.onlyAbnormal
            ? category.biomarkers.filter((b) => b.flag === 'abnormal')
            : category.biomarkers
          return (
            <Card key={category.categoryId}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-slate-800">{category.categoryName}</h3>
                <StatusBadge status={category.status} />
              </div>
              <div className="mt-1 flex gap-3 text-xs text-slate-500">
                <span>
                  <span className="font-semibold text-rose-600">{category.counts.abnormal}</span> out of range
                </span>
                <span>
                  <span className="font-semibold text-slate-600">{category.counts.inRange}</span> in range
                </span>
                <span>
                  <span className="font-semibold text-emerald-600">{category.counts.optimal}</span> optimal
                </span>
              </div>
              <p className={`${text} mt-2 text-slate-600`}>{category.narrative}</p>
              {opts.showBiomarkerTables && biomarkers.length > 0 && (
                <div className="mt-3 overflow-x-auto">
                  <table className={`w-full ${text}`}>
                    <thead>
                      <tr className="border-b border-slate-200 text-left">
                        <th className={`${rowPad} pr-3 font-semibold text-slate-500`}>Biomarker</th>
                        {columns.map((column) => (
                          <th key={column} className={`${rowPad} pr-3 font-semibold text-slate-500`}>
                            {DEEP_DIVE_COLUMN_LABELS[column]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {biomarkers.map((biomarker, i) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0">
                          <td className={`${rowPad} pr-3 font-medium text-slate-700`}>{biomarker.name}</td>
                          {columns.map((column) => (
                            <td key={column} className={`${rowPad} pr-3`}>
                              <BiomarkerCell column={column} biomarker={biomarker} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </section>
  )
}

// ---- custom text ---------------------------------------------------------------

export function CustomTextSection({ options, title }: SectionProps) {
  const opts = safeOptions(CustomTextOptionsSchema, options)
  const { text } = useDensity()
  if (!opts.markdown.trim()) return null
  return (
    <section>
      {title ? <SectionTitle>{title}</SectionTitle> : null}
      <Card className={`${text} text-slate-600`}>
        <Markdown text={opts.markdown} />
      </Card>
    </section>
  )
}
