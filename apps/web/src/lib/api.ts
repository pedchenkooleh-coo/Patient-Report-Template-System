import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  AuditEventDto,
  ClinicDto,
  CreatePatientBody,
  CreateShareBody,
  CreateTemplateBody,
  PatientDto,
  PublishTemplateBody,
  ReportResponse,
  ShareLinkDto,
  TemplateDetailDto,
  TemplateSummaryDto,
  TemplateVersionDetailDto,
  TemplateVersionDto,
  UpdatePatientBody,
  UpdateTemplateBody,
  UpsertReportBody,
} from '@app/shared'
import { getClinicSlug } from './clinic'

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly issues?: unknown[],
  ) {
    super(message)
    this.name = 'ApiRequestError'
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const slug = getClinicSlug()
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(slug ? { 'X-Clinic-Slug': slug } : {}),
      ...init?.headers,
    },
  })
  if (res.status === 204) return undefined as T
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const err = body?.error ?? {}
    throw new ApiRequestError(
      res.status,
      err.code ?? 'UNKNOWN',
      err.message ?? `Request failed (${res.status})`,
      err.issues,
    )
  }
  return body as T
}

// Query keys are scoped by clinic slug so switching clinics never shows stale
// cross-tenant data from the cache.
const scoped = (...parts: unknown[]) => [getClinicSlug(), ...parts]

// ---- clinics + templates -----------------------------------------------------

export function useClinics() {
  return useQuery({ queryKey: ['clinics'], queryFn: () => api<ClinicDto[]>('/api/clinics') })
}

export function useTemplates() {
  return useQuery({
    queryKey: scoped('templates'),
    queryFn: () => api<TemplateSummaryDto[]>('/api/templates'),
  })
}

export function useTemplate(id: string | undefined) {
  return useQuery({
    queryKey: scoped('templates', id),
    queryFn: () => api<TemplateDetailDto>(`/api/templates/${id}`),
    enabled: !!id,
  })
}

export function useTemplateVersions(id: string | undefined) {
  return useQuery({
    queryKey: scoped('templates', id, 'versions'),
    queryFn: () => api<TemplateVersionDto[]>(`/api/templates/${id}/versions`),
    enabled: !!id,
  })
}

function useInvalidateTemplates() {
  const qc = useQueryClient()
  // Report responses embed the live template, so invalidate those too.
  return () => {
    void qc.invalidateQueries({ queryKey: scoped('templates') })
    void qc.invalidateQueries({ queryKey: scoped('report') })
  }
}

export function useCreateTemplate() {
  const invalidate = useInvalidateTemplates()
  return useMutation({
    mutationFn: (body: CreateTemplateBody) =>
      api<TemplateDetailDto>('/api/templates', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: invalidate,
  })
}

export function useUpdateTemplate(id: string) {
  const invalidate = useInvalidateTemplates()
  return useMutation({
    mutationFn: (body: UpdateTemplateBody) =>
      api<TemplateDetailDto>(`/api/templates/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: invalidate,
  })
}

export function usePublishTemplate(id: string) {
  const invalidate = useInvalidateTemplates()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: PublishTemplateBody) =>
      api<TemplateDetailDto>(`/api/templates/${id}/publish`, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      invalidate()
      void qc.invalidateQueries({ queryKey: scoped('templates', id, 'versions') })
      void qc.invalidateQueries({ queryKey: scoped('audit') })
    },
  })
}

export function useRestoreVersion(id: string) {
  const invalidate = useInvalidateTemplates()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (version: number) =>
      api<TemplateDetailDto>(`/api/templates/${id}/versions/${version}/restore`, { method: 'POST' }),
    onSuccess: () => {
      invalidate()
      void qc.invalidateQueries({ queryKey: scoped('templates', id) })
    },
  })
}

export function fetchVersion(id: string, version: number) {
  return api<TemplateVersionDetailDto>(`/api/templates/${id}/versions/${version}`)
}

export function useSetDefaultTemplate() {
  const invalidate = useInvalidateTemplates()
  return useMutation({
    mutationFn: (id: string) =>
      api<TemplateDetailDto>(`/api/templates/${id}/default`, { method: 'POST' }),
    onSuccess: invalidate,
  })
}

export function useDeleteTemplate() {
  const invalidate = useInvalidateTemplates()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<void>(`/api/templates/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      invalidate()
      void qc.invalidateQueries({ queryKey: scoped('patients') })
    },
  })
}

// ---- patients + reports ------------------------------------------------------

export function usePatients() {
  return useQuery({ queryKey: scoped('patients'), queryFn: () => api<PatientDto[]>('/api/patients') })
}

export function useReport(patientId: string | undefined, templateId?: string) {
  const search = templateId ? `?templateId=${encodeURIComponent(templateId)}` : ''
  return useQuery({
    queryKey: scoped('report', patientId, templateId ?? 'default'),
    queryFn: () => api<ReportResponse>(`/api/patients/${patientId}/report${search}`),
    enabled: !!patientId,
  })
}

function useInvalidatePatients() {
  const qc = useQueryClient()
  return () => {
    void qc.invalidateQueries({ queryKey: scoped('patients') })
    void qc.invalidateQueries({ queryKey: scoped('report') })
  }
}

export function useCreatePatient() {
  const invalidate = useInvalidatePatients()
  return useMutation({
    mutationFn: (body: CreatePatientBody) =>
      api<PatientDto>('/api/patients', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: invalidate,
  })
}

export function useUpdatePatient() {
  const invalidate = useInvalidatePatients()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdatePatientBody }) =>
      api<PatientDto>(`/api/patients/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: invalidate,
  })
}

export function useDeletePatient() {
  const invalidate = useInvalidatePatients()
  return useMutation({
    mutationFn: (id: string) => api<void>(`/api/patients/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })
}

export function useSaveReport(patientId: string) {
  const invalidate = useInvalidatePatients()
  return useMutation({
    mutationFn: (body: UpsertReportBody) =>
      api<{ ok: boolean }>(`/api/patients/${patientId}/report`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    onSuccess: invalidate,
  })
}

// ---- sharing + audit ---------------------------------------------------------

export function usePatientShares(patientId: string | undefined) {
  return useQuery({
    queryKey: scoped('shares', patientId),
    queryFn: () => api<ShareLinkDto[]>(`/api/patients/${patientId}/shares`),
    enabled: !!patientId,
  })
}

export function useCreateShare(patientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateShareBody) =>
      api<ShareLinkDto>(`/api/patients/${patientId}/share`, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: scoped('shares', patientId) }),
  })
}

export function useRevokeShare(patientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<ShareLinkDto>(`/api/shares/${id}`, { method: 'DELETE' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: scoped('shares', patientId) }),
  })
}

export function useAudit() {
  return useQuery({ queryKey: scoped('audit'), queryFn: () => api<AuditEventDto[]>('/api/audit') })
}
