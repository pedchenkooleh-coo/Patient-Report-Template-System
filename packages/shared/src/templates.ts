import type { TemplateConfig } from './template-config'

/**
 * BASE_TEMPLATE: every section enabled, in the reference report's order.
 * custom_text is included last with empty markdown — the renderer skips
 * sections with no underlying content, so it is invisible until a clinic
 * fills in its own branding/disclaimer text.
 */
export const BASE_TEMPLATE: TemplateConfig = {
  version: 1,
  theme: { accent: '#2563eb', font: 'sans', density: 'comfortable' },
  sections: [
    { id: 'header', type: 'header', enabled: true, options: {} },
    { id: 'health_status', type: 'health_status', enabled: true, options: { showAuthor: true } },
    { id: 'story', type: 'story', enabled: true, options: {} },
    {
      id: 'goals',
      type: 'goals',
      enabled: true,
      options: { showMetricsTable: true, showTimeframe: true },
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
      enabled: true,
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
        onlyAbnormal: false,
        showBiomarkerTables: true,
        columns: ['relevancy', 'value', 'referenceRange', 'optimalRange', 'date'],
      },
    },
    { id: 'custom_text', type: 'custom_text', enabled: true, options: { markdown: '' } },
  ],
}

/** BLANK_TEMPLATE: default theme, no sections — a clean slate for the editor. */
export const BLANK_TEMPLATE: TemplateConfig = {
  version: 1,
  theme: { accent: '#2563eb', font: 'sans', density: 'comfortable' },
  sections: [],
}
