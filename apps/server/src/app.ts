import { randomBytes } from 'node:crypto'
import express from 'express'
import type { PrismaClient, Template } from '@prisma/client'
import { z } from 'zod'
import {
  BASE_TEMPLATE,
  BLANK_TEMPLATE,
  CreatePatientBodySchema,
  CreateShareBodySchema,
  CreateTemplateBodySchema,
  PublishTemplateBodySchema,
  TemplateConfigSchema,
  UpdatePatientBodySchema,
  UpdateTemplateBodySchema,
  UpsertReportBodySchema,
  type ReportData,
  type TemplateConfig,
  type TemplateDetailDto,
  type TemplateSummaryDto,
} from '@app/shared'
import { HttpError, notFound } from './errors'
import { asyncHandler, clinicResolver, errorHandler } from './middleware'

const IdParamsSchema = z.object({ id: z.string().min(1) })
const VersionParamsSchema = z.object({ id: z.string().min(1), version: z.coerce.number().int().positive() })
const TokenParamsSchema = z.object({ token: z.string().min(1) })
const ReportQuerySchema = z.object({ templateId: z.string().min(1).optional() })

function isPublished(t: Template): boolean {
  return t.publishedConfig !== null
}

function hasUnpublishedChanges(t: Template): boolean {
  return !isPublished(t) || t.version !== t.publishedVersion
}

function toSummary(t: Template): TemplateSummaryDto {
  return {
    id: t.id,
    name: t.name,
    isDefault: t.isDefault,
    version: t.version,
    publishedVersion: t.publishedVersion,
    isPublished: isPublished(t),
    hasUnpublishedChanges: hasUnpublishedChanges(t),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }
}

function toDetail(t: Template): TemplateDetailDto {
  return {
    ...toSummary(t),
    config: parseConfig(t.config),
    publishedConfig: t.publishedConfig ? parseConfig(t.publishedConfig) : null,
  }
}

function parseConfig(json: string): TemplateConfig {
  // Stored configs were validated on write; re-parse defensively on read.
  return TemplateConfigSchema.parse(JSON.parse(json))
}

/** The config a patient report should render for a given template. */
function liveConfig(t: Template): TemplateConfig {
  return parseConfig(t.publishedConfig ?? t.config)
}

export function createApp(prisma: PrismaClient) {
  const app = express()
  app.use(express.json({ limit: '2mb' }))

  const audit = (
    clinicId: string,
    actor: string,
    action: string,
    targetType: string,
    targetId: string,
    summary: string,
  ) =>
    prisma.auditEvent.create({
      data: { clinicId, actor, action, targetType, targetId, summary },
    })

  // ---- unauthenticated endpoints --------------------------------------------

  // The clinic list is the "login screen".
  app.get(
    '/api/clinics',
    asyncHandler(async (_req, res) => {
      const clinics = await prisma.clinic.findMany({ orderBy: { name: 'asc' } })
      res.json(clinics.map(({ id, name, slug }) => ({ id, name, slug })))
    }),
  )

  // Public read-only report via an unguessable share token — NO clinic header.
  app.get(
    '/api/share/:token',
    asyncHandler(async (req, res) => {
      const { token } = TokenParamsSchema.parse(req.params)
      const link = await prisma.shareLink.findUnique({ where: { token } })
      const expired = link?.expiresAt ? link.expiresAt.getTime() < Date.now() : false
      if (!link || link.revokedAt || expired) throw notFound('Shared report')

      const [clinic, patient, reportRow] = await Promise.all([
        prisma.clinic.findUnique({ where: { id: link.clinicId } }),
        prisma.patient.findUnique({ where: { id: link.patientId } }),
        prisma.report.findFirst({
          where: { patientId: link.patientId, clinicId: link.clinicId },
          orderBy: { generatedDate: 'desc' },
        }),
      ])
      if (!clinic || !patient || !reportRow) throw notFound('Shared report')

      const template = await resolveTemplateForShare(prisma, link.clinicId, link.templateId, patient.templateId)
      res.json({
        clinicName: clinic.name,
        patientName: patient.name,
        report: JSON.parse(reportRow.data) as ReportData,
        template,
      })
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
      } else if ('duplicateOf' in body.from) {
        const source = await prisma.template.findFirst({
          where: { id: body.from.duplicateOf, clinicId: req.clinic.id },
        })
        if (!source) throw notFound('Template')
        config = parseConfig(source.config)
      } else {
        config = body.from.config // imported JSON, already schema-validated
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
      await audit(req.clinic.id, req.clinic.slug, 'template.create', 'template', created.id, `Created "${created.name}"`)
      res.status(201).json(toDetail(created))
    }),
  )

  app.get(
    '/api/templates/:id',
    asyncHandler(async (req, res) => {
      const { id } = IdParamsSchema.parse(req.params)
      const template = await prisma.template.findFirst({ where: { id, clinicId: req.clinic.id } })
      if (!template) throw notFound('Template')
      res.json(toDetail(template))
    }),
  )

  app.put(
    '/api/templates/:id',
    asyncHandler(async (req, res) => {
      const { id } = IdParamsSchema.parse(req.params)
      const body = UpdateTemplateBodySchema.parse(req.body)

      const existing = await prisma.template.findFirst({ where: { id, clinicId: req.clinic.id } })
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
      await audit(req.clinic.id, req.clinic.slug, 'template.update', 'template', updated.id, `Edited "${updated.name}" (draft v${updated.version})`)
      res.json(toDetail(updated))
    }),
  )

  // Publish the current draft: snapshot it as a version and make it live.
  app.post(
    '/api/templates/:id/publish',
    asyncHandler(async (req, res) => {
      const { id } = IdParamsSchema.parse(req.params)
      const body = PublishTemplateBodySchema.parse(req.body ?? {})
      const template = await prisma.template.findFirst({ where: { id, clinicId: req.clinic.id } })
      if (!template) throw notFound('Template')
      if (template.publishedVersion === template.version && isPublished(template)) {
        throw new HttpError(409, 'NOTHING_TO_PUBLISH', 'There are no unpublished changes to publish.')
      }
      // Re-validate the draft before it goes live to patients.
      const config = parseConfig(template.config)

      const [updated] = await prisma.$transaction([
        prisma.template.update({
          where: { id: template.id },
          data: { publishedConfig: JSON.stringify(config), publishedVersion: template.version },
        }),
        prisma.templateVersion.upsert({
          where: { templateId_version: { templateId: template.id, version: template.version } },
          create: {
            templateId: template.id,
            clinicId: req.clinic.id,
            version: template.version,
            config: JSON.stringify(config),
            note: body.note ?? null,
            actor: req.clinic.slug,
          },
          update: { note: body.note ?? null, actor: req.clinic.slug },
        }),
      ])
      await audit(req.clinic.id, req.clinic.slug, 'template.publish', 'template', template.id, `Published "${template.name}" v${template.version}`)
      res.json(toDetail(updated))
    }),
  )

  // Version history + restore (rollback into a new draft).
  app.get(
    '/api/templates/:id/versions',
    asyncHandler(async (req, res) => {
      const { id } = IdParamsSchema.parse(req.params)
      const template = await prisma.template.findFirst({ where: { id, clinicId: req.clinic.id } })
      if (!template) throw notFound('Template')
      const versions = await prisma.templateVersion.findMany({
        where: { templateId: template.id },
        orderBy: { version: 'desc' },
      })
      res.json(
        versions.map((v) => ({
          id: v.id,
          version: v.version,
          note: v.note,
          actor: v.actor,
          createdAt: v.createdAt.toISOString(),
          isLive: v.version === template.publishedVersion,
        })),
      )
    }),
  )

  app.get(
    '/api/templates/:id/versions/:version',
    asyncHandler(async (req, res) => {
      const { id, version } = VersionParamsSchema.parse(req.params)
      const template = await prisma.template.findFirst({ where: { id, clinicId: req.clinic.id } })
      if (!template) throw notFound('Template')
      const snapshot = await prisma.templateVersion.findFirst({
        where: { templateId: template.id, version },
      })
      if (!snapshot) throw notFound('Version')
      res.json({
        id: snapshot.id,
        version: snapshot.version,
        note: snapshot.note,
        actor: snapshot.actor,
        createdAt: snapshot.createdAt.toISOString(),
        isLive: snapshot.version === template.publishedVersion,
        config: parseConfig(snapshot.config),
      })
    }),
  )

  app.post(
    '/api/templates/:id/versions/:version/restore',
    asyncHandler(async (req, res) => {
      const { id, version } = VersionParamsSchema.parse(req.params)
      const template = await prisma.template.findFirst({ where: { id, clinicId: req.clinic.id } })
      if (!template) throw notFound('Template')
      const snapshot = await prisma.templateVersion.findFirst({
        where: { templateId: template.id, version },
      })
      if (!snapshot) throw notFound('Version')
      // Restore into the draft (not auto-published) so it can be reviewed first.
      const updated = await prisma.template.update({
        where: { id: template.id },
        data: { config: snapshot.config, version: template.version + 1 },
      })
      await audit(req.clinic.id, req.clinic.slug, 'template.restore', 'template', template.id, `Restored v${version} into draft v${updated.version}`)
      res.json(toDetail(updated))
    }),
  )

  app.post(
    '/api/templates/:id/default',
    asyncHandler(async (req, res) => {
      const { id } = IdParamsSchema.parse(req.params)
      const template = await prisma.template.findFirst({ where: { id, clinicId: req.clinic.id } })
      if (!template) throw notFound('Template')

      const [, updated] = await prisma.$transaction([
        prisma.template.updateMany({
          where: { clinicId: req.clinic.id, isDefault: true },
          data: { isDefault: false },
        }),
        prisma.template.update({ where: { id: template.id }, data: { isDefault: true } }),
      ])
      await audit(req.clinic.id, req.clinic.slug, 'template.setDefault', 'template', template.id, `Set "${template.name}" as default`)
      res.json(toDetail(updated))
    }),
  )

  app.delete(
    '/api/templates/:id',
    asyncHandler(async (req, res) => {
      const { id } = IdParamsSchema.parse(req.params)
      const template = await prisma.template.findFirst({ where: { id, clinicId: req.clinic.id } })
      if (!template) throw notFound('Template')
      if (template.isDefault) {
        throw new HttpError(
          409,
          'DEFAULT_TEMPLATE',
          'The default template cannot be deleted. Set another template as default first.',
        )
      }
      await prisma.template.delete({ where: { id: template.id } })
      // Clear dangling per-patient assignments to this template.
      await prisma.patient.updateMany({
        where: { clinicId: req.clinic.id, templateId: template.id },
        data: { templateId: null },
      })
      await audit(req.clinic.id, req.clinic.slug, 'template.delete', 'template', template.id, `Deleted "${template.name}"`)
      res.status(204).end()
    }),
  )

  // ---- audit log -------------------------------------------------------------

  app.get(
    '/api/audit',
    asyncHandler(async (req, res) => {
      const events = await prisma.auditEvent.findMany({
        where: { clinicId: req.clinic.id },
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
      res.json(
        events.map((e) => ({
          id: e.id,
          actor: e.actor,
          action: e.action,
          targetType: e.targetType,
          targetId: e.targetId,
          summary: e.summary,
          createdAt: e.createdAt.toISOString(),
        })),
      )
    }),
  )

  // ---- patients --------------------------------------------------------------

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
          templateId: p.templateId,
        })),
      )
    }),
  )

  app.post(
    '/api/patients',
    asyncHandler(async (req, res) => {
      const body = CreatePatientBodySchema.parse(req.body)
      const created = await prisma.patient.create({
        data: { clinicId: req.clinic.id, name: body.name, sex: body.sex, age: body.age },
      })
      await audit(req.clinic.id, req.clinic.slug, 'patient.create', 'patient', created.id, `Added patient "${created.name}"`)
      res.status(201).json({
        id: created.id,
        name: created.name,
        sex: created.sex,
        age: created.age,
        hasReport: false,
        templateId: created.templateId,
      })
    }),
  )

  app.put(
    '/api/patients/:id',
    asyncHandler(async (req, res) => {
      const { id } = IdParamsSchema.parse(req.params)
      const body = UpdatePatientBodySchema.parse(req.body)
      const patient = await prisma.patient.findFirst({ where: { id, clinicId: req.clinic.id } })
      if (!patient) throw notFound('Patient')

      if (typeof body.templateId === 'string') {
        // Assigning a template — it must belong to the same clinic.
        const template = await prisma.template.findFirst({
          where: { id: body.templateId, clinicId: req.clinic.id },
        })
        if (!template) throw notFound('Template')
      }

      const updated = await prisma.patient.update({
        where: { id: patient.id },
        data: {
          ...(body.name !== undefined ? { name: body.name } : {}),
          ...(body.sex !== undefined ? { sex: body.sex } : {}),
          ...(body.age !== undefined ? { age: body.age } : {}),
          ...(body.templateId !== undefined ? { templateId: body.templateId } : {}),
        },
        include: { _count: { select: { reports: true } } },
      })
      await audit(req.clinic.id, req.clinic.slug, 'patient.update', 'patient', updated.id, `Updated patient "${updated.name}"`)
      res.json({
        id: updated.id,
        name: updated.name,
        sex: updated.sex,
        age: updated.age,
        hasReport: updated._count.reports > 0,
        templateId: updated.templateId,
      })
    }),
  )

  app.delete(
    '/api/patients/:id',
    asyncHandler(async (req, res) => {
      const { id } = IdParamsSchema.parse(req.params)
      const patient = await prisma.patient.findFirst({ where: { id, clinicId: req.clinic.id } })
      if (!patient) throw notFound('Patient')
      await prisma.patient.delete({ where: { id: patient.id } })
      await audit(req.clinic.id, req.clinic.slug, 'patient.delete', 'patient', patient.id, `Deleted patient "${patient.name}"`)
      res.status(204).end()
    }),
  )

  // ---- report (one per patient in this model) --------------------------------

  app.get(
    '/api/patients/:id/report',
    asyncHandler(async (req, res) => {
      const { id } = IdParamsSchema.parse(req.params)
      const { templateId } = ReportQuerySchema.parse(req.query)

      const patient = await prisma.patient.findFirst({ where: { id, clinicId: req.clinic.id } })
      if (!patient) throw notFound('Patient')

      const reportRow = await prisma.report.findFirst({
        where: { patientId: patient.id, clinicId: req.clinic.id },
        orderBy: { generatedDate: 'desc' },
      })
      if (!reportRow) throw notFound('Report')

      const resolved = await resolveTemplate(prisma, req.clinic.id, templateId, patient.templateId)
      res.json({
        report: JSON.parse(reportRow.data) as ReportData,
        template: resolved.config,
        templateId: resolved.id,
        templateName: resolved.name,
        source: resolved.source,
      })
    }),
  )

  app.put(
    '/api/patients/:id/report',
    asyncHandler(async (req, res) => {
      const { id } = IdParamsSchema.parse(req.params)
      const body = UpsertReportBodySchema.parse(req.body)
      const patient = await prisma.patient.findFirst({ where: { id, clinicId: req.clinic.id } })
      if (!patient) throw notFound('Patient')

      const existing = await prisma.report.findFirst({
        where: { patientId: patient.id, clinicId: req.clinic.id },
      })
      const data = {
        assessmentDate: new Date(body.assessmentDate),
        generatedDate: new Date(body.generatedDate),
        data: JSON.stringify(body.data),
      }
      if (existing) {
        await prisma.report.update({ where: { id: existing.id }, data })
      } else {
        await prisma.report.create({ data: { patientId: patient.id, clinicId: req.clinic.id, ...data } })
      }
      await audit(req.clinic.id, req.clinic.slug, 'report.save', 'report', patient.id, `Saved report for "${patient.name}"`)
      res.json({ ok: true })
    }),
  )

  // ---- sharing ---------------------------------------------------------------

  app.get(
    '/api/patients/:id/shares',
    asyncHandler(async (req, res) => {
      const { id } = IdParamsSchema.parse(req.params)
      const patient = await prisma.patient.findFirst({ where: { id, clinicId: req.clinic.id } })
      if (!patient) throw notFound('Patient')
      const shares = await prisma.shareLink.findMany({
        where: { patientId: patient.id, clinicId: req.clinic.id },
        orderBy: { createdAt: 'desc' },
      })
      res.json(shares.map((s) => shareDto(s)))
    }),
  )

  app.post(
    '/api/patients/:id/share',
    asyncHandler(async (req, res) => {
      const { id } = IdParamsSchema.parse(req.params)
      const body = CreateShareBodySchema.parse(req.body ?? {})
      const patient = await prisma.patient.findFirst({ where: { id, clinicId: req.clinic.id } })
      if (!patient) throw notFound('Patient')

      if (typeof body.templateId === 'string') {
        const template = await prisma.template.findFirst({
          where: { id: body.templateId, clinicId: req.clinic.id },
        })
        if (!template) throw notFound('Template')
      }

      const expiresAt =
        body.expiresInDays != null ? new Date(Date.now() + body.expiresInDays * 86_400_000) : null

      const created = await prisma.shareLink.create({
        data: {
          token: randomBytes(24).toString('base64url'),
          clinicId: req.clinic.id,
          patientId: patient.id,
          templateId: body.templateId ?? null,
          expiresAt,
        },
      })
      await audit(req.clinic.id, req.clinic.slug, 'share.create', 'share', created.id, `Created share link for "${patient.name}"`)
      res.status(201).json(shareDto(created))
    }),
  )

  app.delete(
    '/api/shares/:id',
    asyncHandler(async (req, res) => {
      const { id } = IdParamsSchema.parse(req.params)
      const share = await prisma.shareLink.findFirst({ where: { id, clinicId: req.clinic.id } })
      if (!share) throw notFound('Share link')
      const updated = await prisma.shareLink.update({
        where: { id: share.id },
        data: { revokedAt: new Date() },
      })
      await audit(req.clinic.id, req.clinic.slug, 'share.revoke', 'share', share.id, 'Revoked a share link')
      res.json(shareDto(updated))
    }),
  )

  // Unknown /api routes → consistent 404 shape.
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } })
  })

  app.use(errorHandler)
  return app
}

function shareDto(s: {
  id: string
  token: string
  patientId: string
  templateId: string | null
  createdAt: Date
  expiresAt: Date | null
  revokedAt: Date | null
}) {
  const expired = s.expiresAt ? s.expiresAt.getTime() < Date.now() : false
  return {
    id: s.id,
    token: s.token,
    patientId: s.patientId,
    templateId: s.templateId,
    createdAt: s.createdAt.toISOString(),
    expiresAt: s.expiresAt ? s.expiresAt.toISOString() : null,
    revokedAt: s.revokedAt ? s.revokedAt.toISOString() : null,
    active: !s.revokedAt && !expired,
  }
}

interface ResolvedTemplate {
  config: TemplateConfig
  id: string | null
  name: string | null
  source: 'assigned' | 'default' | 'override' | 'fallback'
}

/** Resolve the effective LIVE template for a patient report (scoped read). */
async function resolveTemplate(
  prisma: PrismaClient,
  clinicId: string,
  overrideId: string | undefined,
  patientTemplateId: string | null,
): Promise<ResolvedTemplate> {
  if (overrideId) {
    const t = await prisma.template.findFirst({ where: { id: overrideId, clinicId } })
    if (!t) throw notFound('Template')
    return { config: liveConfig(t), id: t.id, name: t.name, source: 'override' }
  }
  if (patientTemplateId) {
    const t = await prisma.template.findFirst({ where: { id: patientTemplateId, clinicId } })
    if (t) return { config: liveConfig(t), id: t.id, name: t.name, source: 'assigned' }
  }
  const def = await prisma.template.findFirst({ where: { clinicId, isDefault: true } })
  if (def) return { config: liveConfig(def), id: def.id, name: def.name, source: 'default' }
  return { config: BASE_TEMPLATE, id: null, name: null, source: 'fallback' }
}

async function resolveTemplateForShare(
  prisma: PrismaClient,
  clinicId: string,
  pinnedTemplateId: string | null,
  patientTemplateId: string | null,
): Promise<TemplateConfig> {
  const resolved = await resolveTemplate(prisma, clinicId, pinnedTemplateId ?? undefined, patientTemplateId).catch(
    () => null,
  )
  return resolved?.config ?? BASE_TEMPLATE
}
