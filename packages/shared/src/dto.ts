import { z } from 'zod'
import { ReportDataSchema } from './report-data'
import { TemplateConfigSchema } from './template-config'

/** API DTOs shared by server (validation) and web (types). */

export const ClinicDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
})
export type ClinicDto = z.infer<typeof ClinicDtoSchema>

export const TemplateSummaryDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  isDefault: z.boolean(),
  version: z.number().int(),
  publishedVersion: z.number().int(),
  isPublished: z.boolean(),
  hasUnpublishedChanges: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type TemplateSummaryDto = z.infer<typeof TemplateSummaryDtoSchema>

export const TemplateDetailDtoSchema = TemplateSummaryDtoSchema.extend({
  config: TemplateConfigSchema, // the editable draft
  publishedConfig: TemplateConfigSchema.nullable(),
})
export type TemplateDetailDto = z.infer<typeof TemplateDetailDtoSchema>

export const CreateTemplateBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  from: z.union([
    z.literal('base'),
    z.literal('blank'),
    z.object({ duplicateOf: z.string().min(1) }),
    z.object({ config: TemplateConfigSchema }), // import from JSON
  ]),
})
export type CreateTemplateBody = z.infer<typeof CreateTemplateBodySchema>

export const UpdateTemplateBodySchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    config: TemplateConfigSchema.optional(),
  })
  .refine((body) => body.name !== undefined || body.config !== undefined, {
    message: 'provide at least one of "name" or "config"',
  })
export type UpdateTemplateBody = z.infer<typeof UpdateTemplateBodySchema>

export const PublishTemplateBodySchema = z.object({
  note: z.string().trim().max(280).optional(),
})
export type PublishTemplateBody = z.infer<typeof PublishTemplateBodySchema>

export const TemplateVersionDtoSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  note: z.string().nullable(),
  actor: z.string(),
  createdAt: z.string(),
  isLive: z.boolean(),
})
export type TemplateVersionDto = z.infer<typeof TemplateVersionDtoSchema>

export const TemplateVersionDetailDtoSchema = TemplateVersionDtoSchema.extend({
  config: TemplateConfigSchema,
})
export type TemplateVersionDetailDto = z.infer<typeof TemplateVersionDetailDtoSchema>

export const AuditEventDtoSchema = z.object({
  id: z.string(),
  actor: z.string(),
  action: z.string(),
  targetType: z.string(),
  targetId: z.string(),
  summary: z.string(),
  createdAt: z.string(),
})
export type AuditEventDto = z.infer<typeof AuditEventDtoSchema>

// ---- patients ----------------------------------------------------------------

export const SEX_VALUES = ['male', 'female', 'other'] as const

export const PatientDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  sex: z.string(),
  age: z.number().int(),
  hasReport: z.boolean(),
  templateId: z.string().nullable(),
})
export type PatientDto = z.infer<typeof PatientDtoSchema>

export const CreatePatientBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  sex: z.enum(SEX_VALUES),
  age: z.number().int().min(0).max(130),
})
export type CreatePatientBody = z.infer<typeof CreatePatientBodySchema>

export const UpdatePatientBodySchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    sex: z.enum(SEX_VALUES).optional(),
    age: z.number().int().min(0).max(130).optional(),
    // null clears the assignment; a string sets it; undefined leaves it alone.
    templateId: z.string().min(1).nullable().optional(),
  })
  .refine((b) => Object.keys(b).length > 0, { message: 'provide at least one field' })
export type UpdatePatientBody = z.infer<typeof UpdatePatientBodySchema>

// ---- reports -----------------------------------------------------------------

export const UpsertReportBodySchema = z.object({
  assessmentDate: z.string(),
  generatedDate: z.string(),
  data: ReportDataSchema,
})
export type UpsertReportBody = z.infer<typeof UpsertReportBodySchema>

export const ReportResponseSchema = z.object({
  report: ReportDataSchema,
  template: TemplateConfigSchema,
  templateId: z.string().nullable(),
  templateName: z.string().nullable(),
  source: z.enum(['assigned', 'default', 'override', 'fallback']),
})
export type ReportResponse = z.infer<typeof ReportResponseSchema>

// ---- sharing -----------------------------------------------------------------

export const ShareLinkDtoSchema = z.object({
  id: z.string(),
  token: z.string(),
  patientId: z.string(),
  templateId: z.string().nullable(),
  createdAt: z.string(),
  expiresAt: z.string().nullable(),
  revokedAt: z.string().nullable(),
  active: z.boolean(),
})
export type ShareLinkDto = z.infer<typeof ShareLinkDtoSchema>

export const CreateShareBodySchema = z.object({
  templateId: z.string().min(1).nullable().optional(),
  expiresInDays: z.number().int().min(1).max(365).nullable().optional(),
})
export type CreateShareBody = z.infer<typeof CreateShareBodySchema>

/** Public (unauthenticated) report payload returned by GET /api/share/:token. */
export const PublicReportResponseSchema = z.object({
  clinicName: z.string(),
  patientName: z.string(),
  report: ReportDataSchema,
  template: TemplateConfigSchema,
})
export type PublicReportResponse = z.infer<typeof PublicReportResponseSchema>

export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    issues: z.array(z.unknown()).optional(),
  }),
})
export type ApiError = z.infer<typeof ApiErrorSchema>
