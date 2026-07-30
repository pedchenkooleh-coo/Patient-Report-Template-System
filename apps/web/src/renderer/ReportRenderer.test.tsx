import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'

afterEach(cleanup)
import type { ReportData, TemplateConfig } from '@app/shared'
import { ReportRenderer } from './ReportRenderer'

const DATA: ReportData = {
  meta: {
    patient: { name: 'Jane Test', sex: 'female', age: 50 },
    preparedBy: 'Dr. Spec',
    assessmentDate: '2026-03-01',
    generatedDate: '2026-03-02',
  },
  healthStatus: { narrative: 'A healthy narrative.', authorName: 'Dr. Spec' },
  story: [{ title: 'Chapter One', body: 'Once upon a lab result.' }],
  goals: [],
  plan: { items: [] },
  orders: { labs: [], referrals: [], imaging: [] },
  timeline: [],
  coach: [],
  deepDive: [
    {
      categoryId: 'metabolic',
      categoryName: 'Metabolic Health',
      status: 'at_risk',
      narrative: 'Insulin is elevated.',
      counts: { abnormal: 1, inRange: 1, optimal: 0 },
      biomarkers: [
        {
          name: 'Fasting Insulin',
          relevancy: 'high',
          value: '27.8',
          unit: 'µIU/mL',
          referenceRange: '2.6–24.9',
          optimalRange: '≤ 8.0',
          date: '2026-03-01',
          flag: 'abnormal',
        },
        {
          name: 'HbA1c',
          relevancy: 'medium',
          value: '5.5',
          unit: '%',
          referenceRange: '< 5.7',
          optimalRange: '< 5.4',
          date: '2026-03-01',
          flag: 'in_range',
        },
      ],
    },
  ],
}

// Sections are deliberately allowed to be incomplete/unknown here: the
// renderer's contract is to tolerate options and types it doesn't recognize.
const baseConfig = (sections: unknown[]): TemplateConfig => ({
  version: 1,
  theme: { accent: '#2563eb', font: 'sans', density: 'comfortable' },
  sections: sections as TemplateConfig['sections'],
})

describe('ReportRenderer', () => {
  it('renders enabled sections and omits disabled ones', () => {
    render(
      <ReportRenderer
        data={DATA}
        config={baseConfig([
          { id: 'header', type: 'header', enabled: true, options: {} },
          { id: 'story', type: 'story', enabled: false, options: {} },
          { id: 'health_status', type: 'health_status', enabled: true, options: {} },
        ])}
      />,
    )
    expect(screen.getByText('Jane Test')).toBeTruthy()
    expect(screen.getByText('A healthy narrative.')).toBeTruthy()
    expect(screen.queryByText('Chapter One')).toBeNull()
  })

  it('renders an empty sections array without throwing', () => {
    const { container } = render(<ReportRenderer data={DATA} config={baseConfig([])} />)
    expect(container.querySelector('[data-testid="report-root"]')).toBeTruthy()
  })

  it('skips sections whose underlying data is empty', () => {
    render(
      <ReportRenderer
        data={DATA}
        config={baseConfig([
          { id: 'goals', type: 'goals', enabled: true, options: {} },
          { id: 'timeline', type: 'timeline', enabled: true, options: {} },
        ])}
      />,
    )
    expect(screen.queryByText('Your Goals')).toBeNull()
    expect(screen.queryByText('Your Timeline')).toBeNull()
  })

  it('deep_dive onlyAbnormal filters biomarkers', () => {
    render(
      <ReportRenderer
        data={DATA}
        config={baseConfig([
          {
            id: 'deep_dive',
            type: 'deep_dive',
            enabled: true,
            options: { onlyAbnormal: true, showBiomarkerTables: true, columns: ['value'] },
          },
        ])}
      />,
    )
    expect(screen.getByText('Fasting Insulin')).toBeTruthy()
    expect(screen.queryByText('HbA1c')).toBeNull()
  })

  it('deep_dive respects the configured column subset', () => {
    render(
      <ReportRenderer
        data={DATA}
        config={baseConfig([
          {
            id: 'deep_dive',
            type: 'deep_dive',
            enabled: true,
            options: {
              onlyAbnormal: false,
              showBiomarkerTables: true,
              columns: ['value', 'referenceRange', 'date'],
            },
          },
        ])}
      />,
    )
    expect(screen.getByText('Value')).toBeTruthy()
    expect(screen.getByText('Reference range')).toBeTruthy()
    expect(screen.getByText('Date')).toBeTruthy()
    expect(screen.queryByText('Optimal range')).toBeNull()
    expect(screen.queryByText('Relevancy')).toBeNull()
  })

  it('does not crash on unknown section types or unknown/missing options', () => {
    const config = baseConfig([
      { id: 'header', type: 'header', enabled: true, options: {} },
      // simulate a config written by a future version of the app
      { id: 'x', type: 'ai_summary', enabled: true, options: { model: 'crystal-ball' } },
      { id: 'dd', type: 'deep_dive', enabled: true, options: { columns: 'not-an-array' } },
    ])
    render(<ReportRenderer data={DATA} config={config} />)
    expect(screen.getByText('Jane Test')).toBeTruthy()
    // deep_dive fell back to default options (all columns) instead of crashing
    expect(screen.getByText('Metabolic Health')).toBeTruthy()
    expect(screen.getByText('Optimal range')).toBeTruthy()
  })
})
