import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReportData } from '@app/shared'
import { ReportForm } from './ReportForm'

afterEach(cleanup)

const VALID: ReportData = {
  meta: {
    patient: { name: 'Form Test', sex: 'male', age: 44 },
    preparedBy: 'Dr. Form',
    assessmentDate: '2026-05-01',
    generatedDate: '2026-05-02',
  },
  healthStatus: { narrative: 'ok', authorName: 'Dr. Form' },
  story: [],
  goals: [],
  plan: { items: [] },
  orders: { labs: [], referrals: [], imaging: [] },
  timeline: [],
  coach: [],
  deepDive: [],
}

describe('ReportForm', () => {
  it('submits validated ReportData through the zod resolver', async () => {
    const onSubmit = vi.fn()
    render(<ReportForm initial={VALID} saving={false} onSubmit={onSubmit} onCancel={() => {}} />)

    fireEvent.click(screen.getByRole('button', { name: /save report/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]![0].meta.patient.name).toBe('Form Test')
  })

  it('supports adding an array item (goal) and keeps submitting valid data', async () => {
    const onSubmit = vi.fn()
    render(<ReportForm initial={VALID} saving={false} onSubmit={onSubmit} onCancel={() => {}} />)

    fireEvent.click(screen.getByRole('button', { name: /add goal/i }))
    // A new goal card appears with editable fields.
    expect(screen.getByText(/goal 1/i)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /save report/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]![0].goals.length).toBe(1)
  })
})
