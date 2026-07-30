import { PrismaClient } from '@prisma/client'
import { BASE_TEMPLATE, type ReportData } from '@app/shared'

// file: URLs resolve relative to prisma/schema.prisma for both the CLI
// (global-setup) and the client, so both point at prisma/test.db.
export const testPrisma = new PrismaClient({
  datasources: { db: { url: 'file:./test.db' } },
})

export const MINIMAL_REPORT: ReportData = {
  meta: {
    patient: { name: 'Test Patient', sex: 'female', age: 40 },
    preparedBy: 'Dr. Test',
    assessmentDate: '2026-01-05',
    generatedDate: '2026-01-06',
  },
  healthStatus: { narrative: 'All good.', authorName: 'Dr. Test' },
  story: [],
  goals: [],
  plan: { items: [] },
  orders: { labs: [], referrals: [], imaging: [] },
  timeline: [],
  coach: [],
  deepDive: [],
}

export interface TestFixture {
  clinicA: { id: string; slug: string }
  clinicB: { id: string; slug: string }
  templateA: { id: string }
  patientA: { id: string }
}

/** Wipe the db and create two clinics; clinic A gets a default template + patient + report. */
export async function resetDb(): Promise<TestFixture> {
  await testPrisma.report.deleteMany()
  await testPrisma.patient.deleteMany()
  await testPrisma.template.deleteMany()
  await testPrisma.clinic.deleteMany()

  const clinicA = await testPrisma.clinic.create({
    data: { name: 'Clinic A', slug: 'clinic-a' },
  })
  const clinicB = await testPrisma.clinic.create({
    data: { name: 'Clinic B', slug: 'clinic-b' },
  })
  const templateA = await testPrisma.template.create({
    data: {
      clinicId: clinicA.id,
      name: 'A Default',
      isDefault: true,
      version: 1,
      config: JSON.stringify(BASE_TEMPLATE),
    },
  })
  const patientA = await testPrisma.patient.create({
    data: { clinicId: clinicA.id, name: 'Test Patient', sex: 'female', age: 40 },
  })
  await testPrisma.report.create({
    data: {
      patientId: patientA.id,
      clinicId: clinicA.id,
      assessmentDate: new Date('2026-01-05'),
      generatedDate: new Date('2026-01-06'),
      data: JSON.stringify(MINIMAL_REPORT),
    },
  })
  return { clinicA, clinicB, templateA, patientA }
}
