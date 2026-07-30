import type { FC } from 'react'
import { CustomTextOptionsSchema, type ReportData, type SectionType } from '@app/shared'
import { safeOptions } from './theme'
import {
  CoachSection,
  CustomTextSection,
  DeepDiveSection,
  GoalsSection,
  HeaderSection,
  HealthStatusSection,
  OrdersSection,
  PlanSummarySection,
  StorySection,
  TimelineSection,
  type SectionProps,
} from './sections'

export interface SectionDef {
  Component: FC<SectionProps>
  defaultTitle: string
  /** Sections with no underlying data are skipped entirely. */
  hasData: (data: ReportData, options: unknown) => boolean
}

export const sectionRegistry: Record<SectionType, SectionDef> = {
  header: {
    Component: HeaderSection,
    defaultTitle: 'Personalized Health Report',
    hasData: (data) => Boolean(data.meta?.patient?.name),
  },
  health_status: {
    Component: HealthStatusSection,
    defaultTitle: 'Your Health Status',
    hasData: (data) => Boolean(data.healthStatus?.narrative?.trim()),
  },
  story: {
    Component: StorySection,
    defaultTitle: 'Your Story',
    hasData: (data) => (data.story?.length ?? 0) > 0,
  },
  goals: {
    Component: GoalsSection,
    defaultTitle: 'Your Goals',
    hasData: (data) => (data.goals?.length ?? 0) > 0,
  },
  plan_summary: {
    Component: PlanSummarySection,
    defaultTitle: 'Your Plan at a Glance',
    hasData: (data) => (data.plan?.items?.length ?? 0) > 0,
  },
  orders: {
    Component: OrdersSection,
    defaultTitle: 'Orders & Referrals',
    hasData: (data) =>
      (data.orders?.labs?.length ?? 0) > 0 ||
      (data.orders?.referrals?.length ?? 0) > 0 ||
      (data.orders?.imaging?.length ?? 0) > 0,
  },
  timeline: {
    Component: TimelineSection,
    defaultTitle: 'Your Timeline',
    hasData: (data) => (data.timeline?.length ?? 0) > 0,
  },
  coach: {
    Component: CoachSection,
    defaultTitle: 'Your Plan Coach',
    hasData: (data) => (data.coach?.length ?? 0) > 0,
  },
  deep_dive: {
    Component: DeepDiveSection,
    defaultTitle: 'Deep Dive: Your Results',
    hasData: (data) => (data.deepDive?.length ?? 0) > 0,
  },
  custom_text: {
    Component: CustomTextSection,
    defaultTitle: '',
    // custom_text has no report data behind it — its content lives in options.
    hasData: (_data, options) =>
      Boolean(safeOptions(CustomTextOptionsSchema, options).markdown.trim()),
  },
}
