import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { BASE_TEMPLATE } from '@app/shared'
import { createApp } from '../app'
import { resetDb, testPrisma, type TestFixture } from './helpers'

const app = createApp(testPrisma)
let fx: TestFixture

const asA = { 'X-Clinic-Slug': 'clinic-a' }
const asB = { 'X-Clinic-Slug': 'clinic-b' }

beforeEach(async () => {
  fx = await resetDb()
})

afterAll(async () => {
  await testPrisma.$disconnect()
})

describe('auth middleware', () => {
  it('rejects missing or unknown clinic slugs with 401', async () => {
    const missing = await request(app).get('/api/templates')
    expect(missing.status).toBe(401)
    expect(missing.body.error.code).toBe('UNAUTHENTICATED')

    const unknown = await request(app).get('/api/templates').set('X-Clinic-Slug', 'ghost')
    expect(unknown.status).toBe(401)
  })
})

describe('POST /api/templates', () => {
  it('creates from base, blank and duplicate', async () => {
    const base = await request(app).post('/api/templates').set(asA).send({ name: 'From base', from: 'base' })
    expect(base.status).toBe(201)
    expect(base.body.config.sections.map((s: { type: string }) => s.type)).toEqual(
      BASE_TEMPLATE.sections.map((s) => s.type),
    )
    expect(base.body.isDefault).toBe(false)

    const blank = await request(app).post('/api/templates').set(asA).send({ name: 'From blank', from: 'blank' })
    expect(blank.status).toBe(201)
    expect(blank.body.config.sections).toEqual([])

    const dup = await request(app)
      .post('/api/templates')
      .set(asA)
      .send({ name: 'Copy', from: { duplicateOf: fx.templateA.id } })
    expect(dup.status).toBe(201)
    expect(dup.body.config).toEqual(base.body.config)
  })

  it('validates the body and rejects duplicating another clinic template', async () => {
    const bad = await request(app).post('/api/templates').set(asA).send({ name: '', from: 'nowhere' })
    expect(bad.status).toBe(400)
    expect(bad.body.error.code).toBe('VALIDATION_ERROR')
    expect(bad.body.error.issues.length).toBeGreaterThan(0)

    const crossTenant = await request(app)
      .post('/api/templates')
      .set(asB)
      .send({ name: 'Steal', from: { duplicateOf: fx.templateA.id } })
    expect(crossTenant.status).toBe(404)
  })
})

describe('PUT /api/templates/:id', () => {
  it('rejects a config that disables a mandatory section', async () => {
    const config = structuredClone(BASE_TEMPLATE)
    config.sections.find((s) => s.type === 'header')!.enabled = false

    const res = await request(app).put(`/api/templates/${fx.templateA.id}`).set(asA).send({ config })
    expect(res.status).toBe(400)
    expect(JSON.stringify(res.body.error.issues)).toContain('mandatory')
  })

  it('rejects a config that disables medication safety in an enabled coach section', async () => {
    const config = structuredClone(BASE_TEMPLATE)
    const coach = config.sections.find((s) => s.type === 'coach')!
    if (coach.type === 'coach') coach.options.includeSafety = false

    const res = await request(app).put(`/api/templates/${fx.templateA.id}`).set(asA).send({ config })
    expect(res.status).toBe(400)
    expect(JSON.stringify(res.body.error.issues)).toContain('safety')
  })

  it('bumps the version on config change but not on rename', async () => {
    const renamed = await request(app)
      .put(`/api/templates/${fx.templateA.id}`)
      .set(asA)
      .send({ name: 'Renamed' })
    expect(renamed.status).toBe(200)
    expect(renamed.body.version).toBe(1)

    const reconfigured = await request(app)
      .put(`/api/templates/${fx.templateA.id}`)
      .set(asA)
      .send({ config: BASE_TEMPLATE })
    expect(reconfigured.status).toBe(200)
    expect(reconfigured.body.version).toBe(2)
  })
})

describe('tenant isolation', () => {
  it("clinic B cannot GET or PUT clinic A's template (404, no data leak)", async () => {
    const get = await request(app).get(`/api/templates/${fx.templateA.id}`).set(asB)
    expect(get.status).toBe(404)
    expect(get.body).toEqual({ error: { code: 'NOT_FOUND', message: 'Template not found' } })

    const put = await request(app)
      .put(`/api/templates/${fx.templateA.id}`)
      .set(asB)
      .send({ name: 'Hijacked' })
    expect(put.status).toBe(404)

    // and the template is untouched
    const still = await request(app).get(`/api/templates/${fx.templateA.id}`).set(asA)
    expect(still.body.name).toBe('A Default')
  })

  it("clinic B cannot render clinic A's patient or use A's template as override", async () => {
    const report = await request(app).get(`/api/patients/${fx.patientA.id}/report`).set(asB)
    expect(report.status).toBe(404)

    // B's own patient, but A's template id as override → 404
    const patientB = await testPrisma.patient.create({
      data: { clinicId: fx.clinicB.id, name: 'B Patient', sex: 'male', age: 30 },
    })
    await testPrisma.report.create({
      data: {
        patientId: patientB.id,
        clinicId: fx.clinicB.id,
        assessmentDate: new Date(),
        generatedDate: new Date(),
        data: (await testPrisma.report.findFirstOrThrow()).data,
      },
    })
    const override = await request(app)
      .get(`/api/patients/${patientB.id}/report?templateId=${fx.templateA.id}`)
      .set(asB)
    expect(override.status).toBe(404)
  })
})

describe('DELETE /api/templates/:id', () => {
  it('refuses to delete the default template with 409, deletes others with 204', async () => {
    const res = await request(app).delete(`/api/templates/${fx.templateA.id}`).set(asA)
    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('DEFAULT_TEMPLATE')

    const other = await request(app).post('/api/templates').set(asA).send({ name: 'Extra', from: 'blank' })
    const del = await request(app).delete(`/api/templates/${other.body.id}`).set(asA)
    expect(del.status).toBe(204)
  })
})

describe('GET /api/patients/:id/report', () => {
  it('returns the report with the clinic default template', async () => {
    const res = await request(app).get(`/api/patients/${fx.patientA.id}/report`).set(asA)
    expect(res.status).toBe(200)
    expect(res.body.report.meta.patient.name).toBe('Test Patient')
    expect(res.body.template.sections.length).toBe(BASE_TEMPLATE.sections.length)
  })
})
