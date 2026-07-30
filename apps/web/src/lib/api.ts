import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  ClinicDto,
  CreateTemplateBody,
  PatientDto,
  ReportResponse,
  TemplateDetailDto,
  TemplateSummaryDto,
  UpdateTemplateBody,
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

async function api<T>(path: string, init?: RequestInit): Promise<T> {
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

export function useClinics() {
  return useQuery({
    queryKey: ['clinics'],
    queryFn: () => api<ClinicDto[]>('/api/clinics'),
  })
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

export function usePatients() {
  return useQuery({
    queryKey: scoped('patients'),
    queryFn: () => api<PatientDto[]>('/api/patients'),
  })
}

export function useReport(patientId: string | undefined, templateId?: string) {
  const search = templateId ? `?templateId=${encodeURIComponent(templateId)}` : ''
  return useQuery({
    queryKey: scoped('report', patientId, templateId ?? 'default'),
    queryFn: () => api<ReportResponse>(`/api/patients/${patientId}/report${search}`),
    enabled: !!patientId,
  })
}

function useInvalidateTemplates() {
  const qc = useQueryClient()
  // Report responses embed the default template, so invalidate those too.
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
      api<TemplateDetailDto>(`/api/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    onSuccess: invalidate,
  })
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
  return useMutation({
    mutationFn: (id: string) => api<void>(`/api/templates/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })
}
