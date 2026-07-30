import { z } from 'zod'

/**
 * ReportData is pure DOMAIN data — no presentation concerns.
 * How (and whether) each part is displayed is decided by TemplateConfig.
 */

export const SexSchema = z.enum(['male', 'female', 'other'])
export type Sex = z.infer<typeof SexSchema>

export const ReportMetaSchema = z.object({
  patient: z.object({
    name: z.string(),
    sex: SexSchema,
    age: z.number().int().nonnegative(),
  }),
  preparedBy: z.string(),
  assessmentDate: z.string(), // ISO date (yyyy-mm-dd)
  generatedDate: z.string(),
})

export const HealthStatusSchema = z.object({
  narrative: z.string(),
  authorName: z.string(),
})

export const StoryEntrySchema = z.object({
  title: z.string(),
  body: z.string(),
})

export const GoalMetricSchema = z.object({
  name: z.string(),
  current: z.string(),
  target: z.string(),
  timeframe: z.string(),
})

export const GoalSchema = z.object({
  order: z.number().int(),
  title: z.string(),
  condition: z.string(),
  domains: z.array(z.string()),
  timeframeWeeks: z.number().int().positive(),
  metrics: z.array(GoalMetricSchema),
})

export const PlanItemKindSchema = z.enum([
  'medication',
  'supplement',
  'lifestyle',
  'diet',
  'testing',
  'referral',
])
export type PlanItemKind = z.infer<typeof PlanItemKindSchema>

export const PlanItemSchema = z.object({
  id: z.string(),
  kind: PlanItemKindSchema,
  title: z.string(),
})

export const PlanSchema = z.object({
  items: z.array(PlanItemSchema),
})

export const OrdersSchema = z.object({
  labs: z.array(z.string()),
  referrals: z.array(z.string()),
  imaging: z.array(z.string()),
})

export const TimelineEntrySchema = z.object({
  planItemId: z.string(),
  planItemTitle: z.string(),
  kind: PlanItemKindSchema,
  action: z.string(),
})

export const TimelineMilestoneSchema = z.object({
  offsetLabel: z.string(), // "Now", "1 week", "2 weeks", ...
  entries: z.array(TimelineEntrySchema),
})

export const CoachSafetySchema = z.object({
  avoid: z.string(),
  monitoring: z.string(),
  dosing: z.string(),
  callUs: z.string(), // "call us right away if ..." — patient-safety critical
})

export const CoachEntrySchema = z.object({
  planItemId: z.string(),
  title: z.string(),
  whatToDo: z.string(),
  whyItMatters: z.string(),
  howItWorks: z.string(),
  week1Plan: z.string(),
  eatAvoid: z
    .object({
      eat: z.array(z.string()),
      avoid: z.array(z.string()),
    })
    .optional(),
  faq: z.array(z.object({ q: z.string(), a: z.string() })),
  tip: z.string().optional(),
  safety: CoachSafetySchema.optional(),
})

export const CategoryStatusSchema = z.enum(['at_risk', 'needs_attention', 'optimal'])
export type CategoryStatus = z.infer<typeof CategoryStatusSchema>

export const RelevancySchema = z.enum(['high', 'medium', 'low'])
export type Relevancy = z.infer<typeof RelevancySchema>

export const BiomarkerFlagSchema = z.enum(['abnormal', 'in_range', 'optimal'])
export type BiomarkerFlag = z.infer<typeof BiomarkerFlagSchema>

export const BiomarkerSchema = z.object({
  name: z.string(),
  relevancy: RelevancySchema,
  value: z.string(),
  unit: z.string(),
  referenceRange: z.string(),
  optimalRange: z.string(),
  date: z.string(),
  flag: BiomarkerFlagSchema,
})
export type Biomarker = z.infer<typeof BiomarkerSchema>

export const DeepDiveCategorySchema = z.object({
  categoryId: z.string(),
  categoryName: z.string(),
  status: CategoryStatusSchema,
  narrative: z.string(),
  counts: z.object({
    abnormal: z.number().int().nonnegative(),
    inRange: z.number().int().nonnegative(),
    optimal: z.number().int().nonnegative(),
  }),
  biomarkers: z.array(BiomarkerSchema),
})
export type DeepDiveCategory = z.infer<typeof DeepDiveCategorySchema>

export const ReportDataSchema = z.object({
  meta: ReportMetaSchema,
  healthStatus: HealthStatusSchema,
  story: z.array(StoryEntrySchema),
  goals: z.array(GoalSchema),
  plan: PlanSchema,
  orders: OrdersSchema,
  timeline: z.array(TimelineMilestoneSchema),
  coach: z.array(CoachEntrySchema),
  deepDive: z.array(DeepDiveCategorySchema),
})

export type ReportData = z.infer<typeof ReportDataSchema>
export type ReportMeta = z.infer<typeof ReportMetaSchema>
export type HealthStatus = z.infer<typeof HealthStatusSchema>
export type StoryEntry = z.infer<typeof StoryEntrySchema>
export type Goal = z.infer<typeof GoalSchema>
export type GoalMetric = z.infer<typeof GoalMetricSchema>
export type PlanItem = z.infer<typeof PlanItemSchema>
export type Orders = z.infer<typeof OrdersSchema>
export type TimelineMilestone = z.infer<typeof TimelineMilestoneSchema>
export type TimelineEntry = z.infer<typeof TimelineEntrySchema>
export type CoachEntry = z.infer<typeof CoachEntrySchema>
export type CoachSafety = z.infer<typeof CoachSafetySchema>
