import { PrismaClient } from '@prisma/client'
import {
  BASE_TEMPLATE,
  ReportDataSchema,
  TemplateConfigSchema,
  type TemplateConfig,
} from '@app/shared'
import { FULL_REPORT, lightReport } from './report-fixtures'

const prisma = new PrismaClient()

/** Clinic B's default: trimmed, compact, serif, emerald accent, disclaimer last. */
const NORTHSIDE_TEMPLATE: TemplateConfig = {
  version: 1,
  theme: { accent: '#059669', font: 'serif', density: 'compact' },
  sections: [
    { id: 'header', type: 'header', enabled: true, options: {} },
    { id: 'health_status', type: 'health_status', enabled: true, options: { showAuthor: true } },
    { id: 'story', type: 'story', enabled: false, options: {} },
    {
      id: 'goals',
      type: 'goals',
      enabled: true,
      options: { showMetricsTable: true, showTimeframe: true, maxGoals: 3 },
    },
    { id: 'plan_summary', type: 'plan_summary', enabled: true, options: { groupByKind: true } },
    {
      id: 'orders',
      type: 'orders',
      enabled: true,
      options: { groups: ['labs', 'referrals', 'imaging'] },
    },
    { id: 'timeline', type: 'timeline', enabled: true, options: { style: 'timeline' } },
    {
      id: 'coach',
      type: 'coach',
      enabled: false,
      options: {
        fields: ['whatToDo', 'whyItMatters', 'howItWorks', 'week1Plan', 'faq', 'tip'],
        includeSafety: true,
      },
    },
    {
      id: 'deep_dive',
      type: 'deep_dive',
      enabled: true,
      options: {
        onlyAbnormal: true,
        showBiomarkerTables: true,
        columns: ['value', 'referenceRange', 'date'],
      },
    },
    {
      id: 'custom_text',
      type: 'custom_text',
      enabled: true,
      options: {
        markdown:
          '## About this report\n\n' +
          'This report was prepared by **Northside Longevity** for the patient named above. ' +
          'It summarizes your assessment results and personalized plan; it is **not** a substitute ' +
          'for the conversation with your clinician.\n\n' +
          '- Results reflect the assessment date shown in the header.\n' +
          '- Reference ranges vary between laboratories.\n' +
          '- Questions? Call our care line at (555) 014-2210, Mon–Fri 8am–6pm.\n\n' +
          '*Northside Longevity · 4801 Lakeview Parkway, Suite 300*',
      },
    },
  ],
}

function validateConfig(config: TemplateConfig): string {
  // Fail the seed loudly if a fixture drifts from the schema.
  return JSON.stringify(TemplateConfigSchema.parse(config))
}

/** Create a template already published at version 1, with a version snapshot. */
async function createPublishedTemplate(input: {
  clinicId: string
  name: string
  config: TemplateConfig
}) {
  const json = validateConfig(input.config)
  const template = await prisma.template.create({
    data: {
      clinicId: input.clinicId,
      name: input.name,
      isDefault: true,
      version: 1,
      config: json,
      publishedConfig: json,
      publishedVersion: 1,
    },
  })
  await prisma.templateVersion.create({
    data: {
      templateId: template.id,
      clinicId: input.clinicId,
      version: 1,
      config: json,
      note: 'Initial version',
      actor: 'seed',
    },
  })
  await prisma.auditEvent.create({
    data: {
      clinicId: input.clinicId,
      actor: 'seed',
      action: 'template.publish',
      targetType: 'template',
      targetId: template.id,
      summary: `Published "${input.name}" v1`,
    },
  })
  return template
}

async function main() {
  // Reset in FK-safe order (idempotent seed).
  await prisma.shareLink.deleteMany()
  await prisma.auditEvent.deleteMany()
  await prisma.templateVersion.deleteMany()
  await prisma.report.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.template.deleteMany()
  await prisma.clinic.deleteMany()

  const doron = await prisma.clinic.create({
    data: { name: 'Doron Health', slug: 'doron-health' },
  })
  const northside = await prisma.clinic.create({
    data: { name: 'Northside Longevity', slug: 'northside-longevity' },
  })

  await createPublishedTemplate({
    clinicId: doron.id,
    name: 'Doron Standard Report',
    config: BASE_TEMPLATE,
  })
  await createPublishedTemplate({
    clinicId: northside.id,
    name: 'Northside Concise Report',
    config: NORTHSIDE_TEMPLATE,
  })

  const fullReport = ReportDataSchema.parse(FULL_REPORT)

  // Clinic A patients. Marcus is the full, PDF-modeled report (synthetic name,
  // age/dates matching the reference report header).
  const marcusA = await prisma.patient.create({
    data: { clinicId: doron.id, name: 'Marcus Ellison', sex: 'male', age: 49 },
  })
  const lena = await prisma.patient.create({
    data: { clinicId: doron.id, name: 'Lena Fischer', sex: 'female', age: 44 },
  })

  // Clinic B patients — Marcus's data is duplicated so the template
  // difference between the two clinics is obvious on identical data.
  const marcusB = await prisma.patient.create({
    data: { clinicId: northside.id, name: 'Marcus Ellison', sex: 'male', age: 49 },
  })
  const tomas = await prisma.patient.create({
    data: { clinicId: northside.id, name: 'Tomás Rivera', sex: 'male', age: 61 },
  })

  const fullDates = {
    assessmentDate: new Date('2026-06-29'),
    generatedDate: new Date('2026-06-29'),
  }
  const lightDates = {
    assessmentDate: new Date('2026-07-08'),
    generatedDate: new Date('2026-07-10'),
  }

  await prisma.report.createMany({
    data: [
      { patientId: marcusA.id, clinicId: doron.id, ...fullDates, data: JSON.stringify(fullReport) },
      { patientId: marcusB.id, clinicId: northside.id, ...fullDates, data: JSON.stringify(fullReport) },
      {
        patientId: lena.id,
        clinicId: doron.id,
        ...lightDates,
        data: JSON.stringify(ReportDataSchema.parse(lightReport('Lena Fischer', 'female', 44))),
      },
      {
        patientId: tomas.id,
        clinicId: northside.id,
        ...lightDates,
        data: JSON.stringify(ReportDataSchema.parse(lightReport('Tomás Rivera', 'male', 61))),
      },
    ],
  })

  console.log('Seeded 2 clinics, 2 templates, 4 patients, 4 reports.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
