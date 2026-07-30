import type { CSSProperties } from 'react'
import { ThemeSchema, type ReportData, type SectionType, type TemplateConfig } from '@app/shared'
import { sectionRegistry } from './registry'
import { SectionErrorBoundary } from './SectionErrorBoundary'
import { DEFAULT_THEME, ThemeContext } from './theme'

interface Props {
  data: ReportData
  config: TemplateConfig
}

/**
 * Walks the template's sections in order:
 * - disabled sections are skipped,
 * - unknown section types (from a newer config version) are skipped,
 * - sections with no underlying data are skipped,
 * - each section renders inside its own error boundary.
 */
export function ReportRenderer({ data, config }: Props) {
  const themeResult = ThemeSchema.safeParse(config?.theme)
  const theme = themeResult.success ? themeResult.data : DEFAULT_THEME
  const sections = Array.isArray(config?.sections) ? config.sections : []

  return (
    <ThemeContext.Provider value={theme}>
      <div
        data-testid="report-root"
        className={`${theme.font === 'serif' ? 'font-serif' : 'font-sans'} ${
          theme.density === 'compact' ? 'space-y-4' : 'space-y-6'
        }`}
        style={{ '--accent': theme.accent } as CSSProperties}
      >
        {sections.map((section) => {
          if (!section?.enabled) return null
          const def = sectionRegistry[section.type as SectionType]
          if (!def) return null
          const options = section.options ?? {}
          if (!def.hasData(data, options)) return null
          return (
            <SectionErrorBoundary key={section.id} sectionLabel={section.type}>
              <def.Component data={data} options={options} title={section.title ?? def.defaultTitle} />
            </SectionErrorBoundary>
          )
        })}
      </div>
    </ThemeContext.Provider>
  )
}
