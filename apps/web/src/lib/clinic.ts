/** The picked clinic is the fake auth context, persisted in localStorage. */

const SLUG_KEY = 'clinicSlug'
const NAME_KEY = 'clinicName'

export function getClinicSlug(): string | null {
  return localStorage.getItem(SLUG_KEY)
}

export function getClinicName(): string | null {
  return localStorage.getItem(NAME_KEY)
}

export function setClinic(slug: string, name: string): void {
  localStorage.setItem(SLUG_KEY, slug)
  localStorage.setItem(NAME_KEY, name)
}

export function clearClinic(): void {
  localStorage.removeItem(SLUG_KEY)
  localStorage.removeItem(NAME_KEY)
}
