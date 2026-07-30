import { createContext, useContext } from 'react'
import type { Theme } from '@app/shared'
import { z } from 'zod'

export const DEFAULT_THEME: Theme = { accent: '#2563eb', font: 'sans', density: 'comfortable' }

export const ThemeContext = createContext<Theme>(DEFAULT_THEME)
export const useReportTheme = () => useContext(ThemeContext)

/** density-aware spacing helpers */
export function useDensity() {
  const { density } = useReportTheme()
  const compact = density === 'compact'
  return {
    compact,
    cardPad: compact ? 'p-4' : 'p-6',
    sectionGap: compact ? 'space-y-4' : 'space-y-6',
    blockGap: compact ? 'space-y-3' : 'space-y-4',
    rowPad: compact ? 'py-1.5' : 'py-2.5',
    text: compact ? 'text-[13px] leading-5' : 'text-sm leading-6',
  }
}

/**
 * Options coming from a stored config may be missing fields (older client) or
 * contain unknown ones (newer client). Never crash: parse leniently, and fall
 * back to schema defaults if the stored options are unusable.
 */
export function safeOptions<S extends z.ZodTypeAny>(schema: S, options: unknown): z.infer<S> {
  const parsed = schema.safeParse(options ?? {})
  if (parsed.success) return parsed.data
  const fallback = schema.safeParse({})
  return fallback.success ? fallback.data : ({} as z.infer<S>)
}
