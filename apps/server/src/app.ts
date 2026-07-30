import express from 'express'
import type { PrismaClient, Template } from '@prisma/client'
import { z } from 'zod'
import {
  BASE_TEMPLATE,
  BLANK_TEMPLATE,
  CreateTemplateBodySchema,
  TemplateConfigSchema,
  UpdateTemplateBodySchema,
  type ReportData,
  type TemplateConfig,
  type TemplateDetailDto,
  type TemplateSummaryDto,
} from '@app/shared'
import { HttpError, notFound } from './errors'
import { asyncHandler, clinicResolver, errorHandler } from './middleware'

const IdParamsSchema = z.object({ id: z.string().min(1) })
const ReportQuerySchema = z.object({ templateId: z.string().min(1).optional() })

function toSummary(t: Template): TemplateSummaryDto {
  return {
    id: t.id,
    name: t.name,
    isDefault: t.isDefault,
    version: t.version,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }
}

function toDetail(t: Template): TemplateDetailDto {
  return { ...toSummary(t), config: parseConfig(t) }
}

function parseConfig(t: Template): TemplateConfig {
  // Stored configs were validated on write; re-parse defensively on read.
  return TemplateConfigSchema.parse(JSON.parse(t.config))
}

export function createApp(prisma: PrismaClient) {
  const app = express()
  app.use(express.json({ limit: '1mb' }))

  // The clinic list is the "login screen" — the only unscoped endpoint.
  app.get(
    '/api/clinics',
    asyncHandler(async (_req, res) => {
      const clinics = await prisma.clinic.findMany({ orderBy: { name: 'asc' } })
      res.json(clinics.map(({ id, name, slug }) => ({ id, name, slug })))
    }),
  )

  // Everything below is tenant-scoped.
  app.use('/api', clinicResolver(prisma))

  // ---- templates ------------------------------------------------------------

  app.get(
    '/api/templates',
    asyncHandler(async (req, res) => {
      const templates = await prisma.template.findMany({
        where: { clinicId: req.clinic.id },
        orderBy: { createdAt: 'asc' },
      })
      res.json(templates.map(toSummary))
    }),
  )

  app.post(
    '/api/templates',
    asyncHandler(async (req, res) => {
      const body = CreateTemplateBodySchema.parse(req.body)

      let config: TemplateConfig
      if (body.from === 'base') {
        config = BASE_TEMPLATE
      } else if (body.from === 'blank') {
        config = BLANK_TEMPLATE
      } else {
        const source = await prisma.template.findFirst({
          where: { id: body.from.duplicateOf, clinicId: req.clinic.id },
        })
        if (!source) throw notFound('Template')
        config = parseConfig(source)
      }

      const created = await prisma.template.create({
        data: {
          clinicId: req.clinic.id,
          name: body.name,
          isDefault: false,
          version: 1,
          config: JSON.stringify(config),
        },
      })
      res.status(201).json(toDetail(created))
    }),
  )

  app.get(
    '/api/templates/:id',
    asyncHandler(async (req, res) => {
      const { id } = IdParamsSchema.parse(req.params)
      const template = await prisma.template.findFirst({
        where: { id, clinicId: req.clinic.id },
      })
      if (!template) throw notFound('Template')
      res.json(toDetail(template))
    }),
  )

  app.put(
    '/api/templates/:id',
    asyncHandler(async (req, res) => {
      const { id } = IdParamsSchema.parse(req.params)
      const body = UpdateTemplateBodySchema.parse(req.body)

      const existing = await prisma.template.findFirst({
        where: { id, clinicId: req.clinic.id },
      })
      if (!existing) throw notFound('Template')

      const updated = await prisma.template.update({
        where: { id: existing.id },
        data: {
          ...(body.name !== undefined ? { name: body.name } : {}),
          ...(body.config !== undefined
            ? { config: JSON.stringify(body.config), version: existing.version + 1 }
            : {}),
        },
      })
      res.json(toDetail(updated))
    }),
  )

  app.post(
    '/api/templates/:id/default',
    asyncHandler(async (req, res) => {
      const { id } = IdParamsSchema.parse(req.params)
      const template = await prisma.template.findFirst({
        where: { id, clinicId: req.clinic.id },
      })
      if (!template) throw notFound('Template')

      const [, updated] = await prisma.$transaction([
        prisma.template.updateMany({
          where: { clinicId: req.clinic.id, isDefault: true },
          data: { isDefault: false },
        }),
        prisma.template.update({ where: { id: template.id }, data: { isDefault: true } }),
      ])
      res.json(toDetail(updated))
    }),
  )

  app.delete(
    '/api/templates/:id',
    asyncHandler(async (req, res) => {
      const { id } = IdParamsSchema.parse(req.params)
      const template = await prisma.template.findFirst({
        where: { id, clinicId: req.clinic.id },
      })
      if (!template) throw notFound('Template')
      if (template.isDefault) {
        throw new HttpError(
          409,
          'DEFAULT_TEMPLATE',
          'The default template cannot be deleted. Set another template as default first.',
        )
      }
      await prisma.template.delete({ where: { id: template.id } })
      res.status(204).end()
    }),
  )

  // ---- patients + report ------------------------------------------------------

  app.get(
    '/api/patients',
    asyncHandler(async (req, res) => {
      const patients = await prisma.patient.findMany({
        where: { clinicId: req.clinic.id },
        orderBy: { name: 'asc' },
        include: { _count: { select: { reports: true } } },
      })
      res.json(
        patients.map((p) => ({
          id: p.id,
          name: p.name,
          sex: p.sex,
          age: p.age,
          hasReport: p._count.reports > 0,
        })),
      )
    }),
  )

  app.get(
    '/api/patients/:id/report',
    asyncHandler(async (req, res) => {
      const { id } = IdParamsSchema.parse(req.params)
      const { templateId } = ReportQuerySchema.parse(req.query)

      const patient = await prisma.patient.findFirst({
        where: { id, clinicId: req.clinic.id },
      })
      if (!patient) throw notFound('Patient')

      const reportRow = await prisma.report.findFirst({
        where: { patientId: patient.id, clinicId: req.clinic.id },
        orderBy: { generatedDate: 'desc' },
      })
      if (!reportRow) throw notFound('Report')

      let template: TemplateConfig
      if (templateId) {
        // Preview override — must belong to the same clinic.
        const row = await prisma.template.findFirst({
          where: { id: templateId, clinicId: req.clinic.id },
        })
        if (!row) throw notFound('Template')
        template = parseConfig(row)
      } else {
        const row = await prisma.template.findFirst({
          where: { clinicId: req.clinic.id, isDefault: true },
        })
        // A clinic without a default template still gets a readable report.
        template = row ? parseConfig(row) : BASE_TEMPLATE
      }

      const report = JSON.parse(reportRow.data) as ReportData
      res.json({ report, template })
    }),
  )

  // Unknown /api routes → consistent 404 shape.
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } })
  })

  app.use(errorHandler)
  return app
}
