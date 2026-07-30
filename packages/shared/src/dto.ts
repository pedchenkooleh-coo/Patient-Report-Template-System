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
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type TemplateSummaryDto = z.infer<typeof TemplateSummaryDtoSchema>

export const TemplateDetailDtoSchema = TemplateSummaryDtoSchema.extend({
  config: TemplateConfigSchema,
})
export type TemplateDetailDto = z.infer<typeof TemplateDetailDtoSchema>

export const CreateTemplateBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  from: z.union([
    z.literal('base'),
    z.literal('blank'),
    z.object({ duplicateOf: z.string().min(1) }),
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

export const PatientDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  sex: z.string(),
  age: z.number().int(),
  hasReport: z.boolean(),
})
export type PatientDto = z.infer<typeof PatientDtoSchema>

export const ReportResponseSchema = z.object({
  report: ReportDataSchema,
  template: TemplateConfigSchema,
})
export type ReportResponse = z.infer<typeof ReportResponseSchema>

export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    issues: z.array(z.unknown()).optional(),
  }),
})
export type ApiError = z.infer<typeof ApiErrorSchema>
