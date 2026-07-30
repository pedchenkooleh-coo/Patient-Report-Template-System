import { describe, expect, it } from 'vitest'
import { TemplateConfigSchema } from './template-config'
import { BASE_TEMPLATE, BLANK_TEMPLATE } from './templates'

describe('TemplateConfigSchema', () => {
  it('accepts the built-in templates', () => {
    expect(TemplateConfigSchema.safeParse(BASE_TEMPLATE).success).toBe(true)
    expect(TemplateConfigSchema.safeParse(BLANK_TEMPLATE).success).toBe(true)
  })

  it('rejects an unknown section type', () => {
    const config = {
      ...BLANK_TEMPLATE,
      sections: [{ id: 'x', type: 'hologram', enabled: true, options: {} }],
    }
    const result = TemplateConfigSchema.safeParse(config)
    expect(result.success).toBe(false)
  })

  it('rejects disabling a mandatory section, allows disabling others', () => {
    const disabledHeader = structuredClone(BASE_TEMPLATE)
    disabledHeader.sections.find((s) => s.type === 'header')!.enabled = false
    expect(TemplateConfigSchema.safeParse(disabledHeader).success).toBe(false)

    const disabledStory = structuredClone(BASE_TEMPLATE)
    disabledStory.sections.find((s) => s.type === 'story')!.enabled = false
    expect(TemplateConfigSchema.safeParse(disabledStory).success).toBe(true)
  })

  it('rejects includeSafety=false on an enabled coach section, tolerates it on a disabled one', () => {
    const unsafe = structuredClone(BASE_TEMPLATE)
    const coach = unsafe.sections.find((s) => s.type === 'coach')!
    if (coach.type === 'coach') coach.options.includeSafety = false
    expect(TemplateConfigSchema.safeParse(unsafe).success).toBe(false)

    coach.enabled = false
    expect(TemplateConfigSchema.safeParse(unsafe).success).toBe(true)
  })

  it('keeps unknown option keys (forward compatibility) and fills missing ones with defaults', () => {
    const config = structuredClone(BLANK_TEMPLATE) as Record<string, unknown>
    config.sections = [
      { id: 'g', type: 'goals', enabled: true, options: { futureOption: 42 } },
    ]
    const parsed = TemplateConfigSchema.parse(config)
    const goals = parsed.sections[0]!
    expect(goals.options).toMatchObject({
      futureOption: 42, // preserved
      showMetricsTable: true, // defaulted
      showTimeframe: true,
    })
  })
})
