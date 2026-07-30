import { z } from 'zod'
import { CategoryStatusSchema } from './report-data'

/**
 * A template is DATA, not code. TemplateConfig is a versioned, serializable
 * description of which sections render, in what order, with what options.
 *
 * Forward compatibility notes:
 * - every options object uses .passthrough() so option keys added by a newer
 *   client are stored, not rejected;
 * - every option field has a default, so options written by an OLDER client
 *   (missing newer fields) still parse;
 * - the renderer additionally never trusts options at runtime (unknown or
 *   missing options must not crash the report view).
 */

export const SECTION_TYPES = [
  'header',
  'health_status',
  'story',
  'goals',
  'plan_summary',
  'orders',
  'timeline',
  'coach',
  'deep_dive',
  'custom_text',
] as const

export const SectionTypeSchema = z.enum(SECTION_TYPES)
export type SectionType = z.infer<typeof SectionTypeSchema>

/** Sections that can never be disabled (enforced in schema + editor UI). */
export const MANDATORY_SECTIONS: SectionType[] = ['header']

const sectionBase = {
  id: z.string().min(1),
  title: z.string().optional(), // per-clinic title override
  enabled: z.boolean(),
}

// ---- per-type options -------------------------------------------------------

export const HeaderOptionsSchema = z.object({}).passthrough()
export const HealthStatusOptionsSchema = z
  .object({ showAuthor: z.boolean().default(true) })
  .passthrough()
export const StoryOptionsSchema = z.object({}).passthrough()

export const GoalsOptionsSchema = z
  .object({
    showMetricsTable: z.boolean().default(true),
    showTimeframe: z.boolean().default(true),
    maxGoals: z.number().int().positive().optional(),
  })
  .passthrough()

export const PlanSummaryOptionsSchema = z
  .object({ groupByKind: z.boolean().default(true) })
  .passthrough()

export const ORDER_GROUPS = ['labs', 'referrals', 'imaging'] as const
export const OrdersOptionsSchema = z
  .object({
    groups: z.array(z.enum(ORDER_GROUPS)).default([...ORDER_GROUPS]),
  })
  .passthrough()

export const TimelineOptionsSchema = z
  .object({
    style: z.enum(['timeline', 'list']).default('timeline'),
    maxMilestones: z.number().int().positive().optional(),
  })
  .passthrough()

export const COACH_FIELDS = [
  'whatToDo',
  'whyItMatters',
  'howItWorks',
  'week1Plan',
  'faq',
  'tip',
] as const
export type CoachField = (typeof COACH_FIELDS)[number]
export const CoachOptionsSchema = z
  .object({
    fields: z.array(z.enum(COACH_FIELDS)).default([...COACH_FIELDS]),
    // Medication safety ("call us right away…") is a patient-safety hazard to
    // hide. The schema-level rule lives in TemplateConfigSchema.superRefine.
    includeSafety: z.boolean().default(true),
  })
  .passthrough()

export const DEEP_DIVE_COLUMNS = [
  'relevancy',
  'value',
  'referenceRange',
  'optimalRange',
  'date',
] as const
export type DeepDiveColumn = (typeof DEEP_DIVE_COLUMNS)[number]
export const DeepDiveOptionsSchema = z
  .object({
    onlyAbnormal: z.boolean().default(false),
    showBiomarkerTables: z.boolean().default(true),
    columns: z.array(z.enum(DEEP_DIVE_COLUMNS)).default([...DEEP_DIVE_COLUMNS]),
    statusFilter: z.array(CategoryStatusSchema).optional(),
  })
  .passthrough()

export const CustomTextOptionsSchema = z
  .object({ markdown: z.string().default('') })
  .passthrough()

// ---- section config (discriminated union) -----------------------------------

export const SectionConfigSchema = z.discriminatedUnion('type', [
  z.object({ ...sectionBase, type: z.literal('header'), options: HeaderOptionsSchema.default({}) }),
  z.object({
    ...sectionBase,
    type: z.literal('health_status'),
    options: HealthStatusOptionsSchema.default({}),
  }),
  z.object({ ...sectionBase, type: z.literal('story'), options: StoryOptionsSchema.default({}) }),
  z.object({ ...sectionBase, type: z.literal('goals'), options: GoalsOptionsSchema.default({}) }),
  z.object({
    ...sectionBase,
    type: z.literal('plan_summary'),
    options: PlanSummaryOptionsSchema.default({}),
  }),
  z.object({ ...sectionBase, type: z.literal('orders'), options: OrdersOptionsSchema.default({}) }),
  z.object({
    ...sectionBase,
    type: z.literal('timeline'),
    options: TimelineOptionsSchema.default({}),
  }),
  z.object({ ...sectionBase, type: z.literal('coach'), options: CoachOptionsSchema.default({}) }),
  z.object({
    ...sectionBase,
    type: z.literal('deep_dive'),
    options: DeepDiveOptionsSchema.default({}),
  }),
  z.object({
    ...sectionBase,
    type: z.literal('custom_text'),
    options: CustomTextOptionsSchema.default({}),
  }),
])

export type SectionConfig = z.infer<typeof SectionConfigSchema>
export type SectionOptionsOf<T extends SectionType> = Extract<SectionConfig, { type: T }>['options']

// ---- theme + full config ----------------------------------------------------

export const ThemeSchema = z.object({
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'accent must be a #rrggbb hex color'),
  font: z.enum(['sans', 'serif']),
  density: z.enum(['comfortable', 'compact']),
})
export type Theme = z.infer<typeof ThemeSchema>

export const TemplateConfigSchema = z
  .object({
    version: z.literal(1),
    theme: ThemeSchema,
    sections: z.array(SectionConfigSchema),
  })
  .superRefine((config, ctx) => {
    const seenIds = new Set<string>()
    config.sections.forEach((section, index) => {
      if (seenIds.has(section.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sections', index, 'id'],
          message: `duplicate section id "${section.id}"`,
        })
      }
      seenIds.add(section.id)

      if (MANDATORY_SECTIONS.includes(section.type) && !section.enabled) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sections', index, 'enabled'],
          message: `section "${section.type}" is mandatory and cannot be disabled`,
        })
      }

      // Patient safety: an enabled coach section must always include the
      // medication-safety block (avoid / monitoring / dosing / "call us right away").
      if (section.type === 'coach' && section.enabled && section.options.includeSafety === false) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sections', index, 'options', 'includeSafety'],
          message: 'medication safety information cannot be disabled (patient-safety hazard)',
        })
      }
    })
  })

export type TemplateConfig = z.infer<typeof TemplateConfigSchema>
