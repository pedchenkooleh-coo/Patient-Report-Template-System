import type { ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ReportDataSchema, SEX_VALUES, type ReportData } from '@app/shared'
import { FormArea, FormNumber, FormRow, FormSelect, FormText, Repeater, StringList } from './rhf'

const KINDS = ['medication', 'supplement', 'lifestyle', 'diet', 'testing', 'referral'] as const
const STATUSES = ['at_risk', 'needs_attention', 'optimal'] as const
const RELEVANCY = ['high', 'medium', 'low'] as const
const FLAGS = ['abnormal', 'in_range', 'optimal'] as const

const genId = () => `id-${crypto.randomUUID().slice(0, 8)}`

/**
 * Schema-driven structured editor for ReportData. Fields not rendered here
 * (e.g. optional coach.eatAvoid) pass through unchanged from the initial value,
 * and the whole object is validated by the zodResolver on submit.
 */
export function ReportForm({
  initial,
  saving,
  onSubmit,
  onCancel,
}: {
  initial: ReportData
  saving: boolean
  onSubmit: (data: ReportData) => void
  onCancel: () => void
}) {
  const methods = useForm<ReportData>({
    resolver: zodResolver(ReportDataSchema),
    defaultValues: initial,
  })

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-2">
        <Accordion title="Patient & meta" defaultOpen>
          <FormRow>
            <FormText name="meta.patient.name" label="Patient name" />
            <FormSelect name="meta.patient.sex" label="Sex" options={SEX_VALUES} />
            <FormNumber name="meta.patient.age" label="Age" />
          </FormRow>
          <FormText name="meta.preparedBy" label="Prepared by" />
          <FormRow>
            <FormText name="meta.assessmentDate" label="Assessment date (YYYY-MM-DD)" />
            <FormText name="meta.generatedDate" label="Generated date (YYYY-MM-DD)" />
          </FormRow>
        </Accordion>

        <Accordion title="Health status">
          <FormArea name="healthStatus.narrative" label="Narrative" rows={5} />
          <FormText name="healthStatus.authorName" label="Author" />
        </Accordion>

        <Accordion title={`Story (${initial.story.length})`}>
          <Repeater name="story" itemLabel="Chapter" makeEmpty={() => ({ title: '', body: '' })}>
            {(base) => (
              <>
                <FormText name={`${base}.title`} label="Title" />
                <FormArea name={`${base}.body`} label="Body" />
              </>
            )}
          </Repeater>
        </Accordion>

        <Accordion title={`Goals (${initial.goals.length})`}>
          <Repeater
            name="goals"
            itemLabel="Goal"
            makeEmpty={() => ({
              order: 1,
              title: '',
              condition: '',
              domains: [],
              timeframeWeeks: 12,
              metrics: [],
            })}
          >
            {(base) => (
              <>
                <FormRow>
                  <FormNumber name={`${base}.order`} label="Order" />
                  <FormNumber name={`${base}.timeframeWeeks`} label="Timeframe (weeks)" />
                </FormRow>
                <FormText name={`${base}.title`} label="Title" />
                <FormText name={`${base}.condition`} label="Condition" />
                <StringList name={`${base}.domains`} label="Domains" placeholder="e.g. Metabolic Health" />
                <div className="text-xs font-medium text-slate-500">Metrics</div>
                <Repeater
                  name={`${base}.metrics`}
                  itemLabel="Metric"
                  makeEmpty={() => ({ name: '', current: '', target: '', timeframe: '' })}
                >
                  {(m) => (
                    <FormRow>
                      <FormText name={`${m}.name`} label="Name" />
                      <FormText name={`${m}.current`} label="Current" />
                      <FormText name={`${m}.target`} label="Target" />
                      <FormText name={`${m}.timeframe`} label="Timeframe" />
                    </FormRow>
                  )}
                </Repeater>
              </>
            )}
          </Repeater>
        </Accordion>

        <Accordion title={`Plan items (${initial.plan.items.length})`}>
          <Repeater
            name="plan.items"
            itemLabel="Item"
            makeEmpty={() => ({ id: genId(), kind: 'lifestyle', title: '' })}
          >
            {(base) => (
              <FormRow>
                <FormSelect name={`${base}.kind`} label="Kind" options={KINDS} />
                <FormText name={`${base}.title`} label="Title" />
              </FormRow>
            )}
          </Repeater>
        </Accordion>

        <Accordion title="Orders">
          <StringList name="orders.labs" label="Labs" />
          <StringList name="orders.referrals" label="Referrals" />
          <StringList name="orders.imaging" label="Imaging" />
        </Accordion>

        <Accordion title={`Timeline (${initial.timeline.length})`}>
          <Repeater
            name="timeline"
            itemLabel="Milestone"
            makeEmpty={() => ({ offsetLabel: '', entries: [] })}
          >
            {(base) => (
              <>
                <FormText name={`${base}.offsetLabel`} label="Offset label (e.g. 2 weeks)" />
                <Repeater
                  name={`${base}.entries`}
                  itemLabel="Entry"
                  makeEmpty={() => ({ planItemId: '', planItemTitle: '', kind: 'lifestyle', action: '' })}
                >
                  {(e) => (
                    <>
                      <FormRow>
                        <FormText name={`${e}.planItemTitle`} label="Plan item" />
                        <FormSelect name={`${e}.kind`} label="Kind" options={KINDS} />
                      </FormRow>
                      <FormText name={`${e}.action`} label="Action" />
                    </>
                  )}
                </Repeater>
              </>
            )}
          </Repeater>
        </Accordion>

        <Accordion title={`Coach cards (${initial.coach.length})`}>
          <Repeater
            name="coach"
            itemLabel="Card"
            makeEmpty={() => ({
              planItemId: '',
              title: '',
              whatToDo: '',
              whyItMatters: '',
              howItWorks: '',
              week1Plan: '',
              faq: [],
            })}
          >
            {(base) => (
              <>
                <FormText name={`${base}.title`} label="Title" />
                <FormArea name={`${base}.whatToDo`} label="What to do" />
                <FormArea name={`${base}.whyItMatters`} label="Why it matters" />
                <FormArea name={`${base}.howItWorks`} label="How it works" />
                <FormArea name={`${base}.week1Plan`} label="Week 1 plan" />
                <FormText name={`${base}.tip`} label="Tip (optional)" />
                <div className="text-xs font-medium text-slate-500">FAQ</div>
                <Repeater name={`${base}.faq`} itemLabel="Q&A" makeEmpty={() => ({ q: '', a: '' })}>
                  {(f) => (
                    <>
                      <FormText name={`${f}.q`} label="Question" />
                      <FormArea name={`${f}.a`} label="Answer" rows={2} />
                    </>
                  )}
                </Repeater>
              </>
            )}
          </Repeater>
        </Accordion>

        <Accordion title={`Deep dive (${initial.deepDive.length})`}>
          <Repeater
            name="deepDive"
            itemLabel="Category"
            makeEmpty={() => ({
              categoryId: genId(),
              categoryName: '',
              status: 'needs_attention',
              narrative: '',
              counts: { abnormal: 0, inRange: 0, optimal: 0 },
              biomarkers: [],
            })}
          >
            {(base) => (
              <>
                <FormRow>
                  <FormText name={`${base}.categoryName`} label="Category" />
                  <FormSelect name={`${base}.status`} label="Status" options={STATUSES} />
                </FormRow>
                <FormArea name={`${base}.narrative`} label="Narrative" />
                <FormRow>
                  <FormNumber name={`${base}.counts.abnormal`} label="Abnormal" />
                  <FormNumber name={`${base}.counts.inRange`} label="In range" />
                  <FormNumber name={`${base}.counts.optimal`} label="Optimal" />
                </FormRow>
                <div className="text-xs font-medium text-slate-500">Biomarkers</div>
                <Repeater
                  name={`${base}.biomarkers`}
                  itemLabel="Biomarker"
                  makeEmpty={() => ({
                    name: '',
                    relevancy: 'medium',
                    value: '',
                    unit: '',
                    referenceRange: '',
                    optimalRange: '',
                    date: '',
                    flag: 'in_range',
                  })}
                >
                  {(b) => (
                    <>
                      <FormRow>
                        <FormText name={`${b}.name`} label="Name" />
                        <FormSelect name={`${b}.relevancy`} label="Relevancy" options={RELEVANCY} />
                        <FormSelect name={`${b}.flag`} label="Flag" options={FLAGS} />
                      </FormRow>
                      <FormRow>
                        <FormText name={`${b}.value`} label="Value" />
                        <FormText name={`${b}.unit`} label="Unit" />
                        <FormText name={`${b}.date`} label="Date" />
                      </FormRow>
                      <FormRow>
                        <FormText name={`${b}.referenceRange`} label="Reference range" />
                        <FormText name={`${b}.optimalRange`} label="Optimal range" />
                      </FormRow>
                    </>
                  )}
                </Repeater>
              </>
            )}
          </Repeater>
        </Accordion>

        <div className="sticky bottom-0 -mx-4 mt-2 flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-4 py-3">
          {!methods.formState.isValid && methods.formState.submitCount > 0 && (
            <span className="mr-auto text-xs text-rose-600">Please fix the highlighted fields.</span>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save report'}
          </button>
        </div>
      </form>
    </FormProvider>
  )
}

function Accordion({
  title,
  defaultOpen,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  return (
    <details open={defaultOpen} className="rounded-lg border border-slate-200">
      <summary className="cursor-pointer select-none px-3 py-2 text-sm font-semibold text-slate-700">
        {title}
      </summary>
      <div className="space-y-2 border-t border-slate-100 p-3">{children}</div>
    </details>
  )
}
