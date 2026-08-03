# Design decisions

## Template abstraction: config-as-data + renderer registry

A template is a versioned JSON document (`TemplateConfig`): a theme plus an ordered list of
section configs, where each section's options are a **Zod discriminated union** keyed on
`type`. The frontend owns a `Record<SectionType, SectionDef>` registry mapping each type to
a React component, a default title, and a `hasData` predicate. Rendering is a fold over the
config: skip disabled, skip unknown types, skip empty data, wrap each section in an error
boundary.

Why this wins for this product:

- **Templates are validated data, not executable code.** The server can reject a bad
  template at save time with precise Zod issues; nothing a clinic saves can run code.
- **One renderer, N clinics.** Every rendering improvement (accessibility, styling, new
  section capabilities) ships to all tenants at once.
- **The editor falls out of the schema.** The options forms mirror the discriminated union;
  adding an option = one schema field + one form control + one component branch.

### Rejected alternatives

- **Handlebars/MJML string templates.** Clinics would effectively author code: injection
  and XSS surface, no type safety between template and data, terribly hard to validate
  (what does "this template disables medication safety" even mean in a string?), and every
  design refresh requires migrating N clinic-authored strings. String templates make sense
  for email variance; here the *structure* varies, not the markup.
- **One React component per clinic.** Maximum flexibility, but templates become deploys:
  clinics can't self-serve, tenant count scales the codebase linearly, and per-clinic code
  rots. This is the "no abstraction" baseline the product exists to avoid.
- **Free-form block builder (Notion-style).** Overkill for a clinical document with a known
  section vocabulary. Arbitrary nesting/layout explodes the schema and editor complexity,
  and makes safety guarantees ("the safety block is always shown") much harder to state.
  A flat, typed section list matches the actual domain: a report is a sequence of known
  sections in clinic-chosen order with clinic-chosen knobs.

## Separate Express API vs a fullstack framework

Next/Remix would collapse the proxy and give one dev server, but the assignment's center of
gravity is a **typed API contract with tenant scoping** — clearer as an explicit Express app
(middleware → routes → central error handler) than as framework loaders/actions. The
`createApp(prisma)` factory also makes supertest trivial: tests run the real middleware
stack against a throwaway SQLite db with no HTTP server. The shared package keeps end-to-end
types without a framework's help.

## Config versioning & forward compatibility

Two version numbers with different jobs:

- `TemplateConfig.version` (schema version, currently `1`) — the shape contract. A future
  breaking change bumps it and gets an explicit migration on read.
- `Template.version` (row counter) — bumped by the server on every config change; a cheap
  audit/debug signal ("v7") and a hook for optimistic concurrency later.

Forward compatibility is layered so old and new clients can coexist:

1. every options object is `.passthrough()` — unknown keys are stored, not stripped or
   rejected;
2. every option field has a default — configs written before a field existed still parse;
3. the renderer never trusts options: `safeOptions()` falls back to defaults if parsing
   fails, unknown section types are skipped, unknown deep-dive columns are ignored, and each
   section has an error boundary. A config from the future degrades gracefully instead of
   white-screening a patient report.

## Draft / publish + version history (enhancement round)

Editing a template used to mutate the config that patient reports render — a live template
was one careless save away from a broken patient-facing document. That is unacceptable for a
clinical artifact, so templates now have an explicit lifecycle:

- `config` is the editable **draft**; `publishedConfig` is what patient reports render.
- **Publish** re-validates the draft, copies it to `publishedConfig`, and writes an immutable
  `TemplateVersion` snapshot. Reports change *only* on publish.
- `version` counts draft saves; `publishedVersion` marks the live snapshot;
  `hasUnpublishedChanges` drives the editor's status pill and the list badges.
- **Rollback** restores a snapshot into the draft (not straight to live) so it can be
  reviewed and re-published — safer than a one-click revert of the patient-facing config.

Why a snapshot table rather than a diff/event log: snapshots are trivially correct to restore
and render (no replay), storage is negligible at this scale, and "show me exactly what v3
looked like" is O(1). A diff/CRDT approach buys concurrent editing we don't need yet.

`AuditEvent` is an append-only, per-clinic trail for every mutation (create/edit/publish/
restore/setDefault/delete, patient and report changes, share create/revoke). It's the
skeleton a real compliance audit log grows into; here it powers the Activity page.

## Per-patient template assignment vs the default

Reports resolve a template in priority order: `?templateId=` override (preview) →
patient-assigned template → clinic default → `BASE_TEMPLATE` fallback. The assignment is a
nullable `Patient.templateId` rather than a hard FK: deleting a template clears dangling
assignments (and they'd fall back to the default anyway), so a delete can never orphan a
patient into an unrenderable state.

## Public share links

A share link is an unguessable token (`randomBytes(24)`) that resolves — through the one
endpoint mounted *before* the clinic-auth middleware — to a read-only `{ report, template }`
for a single patient, with optional expiry and revocation. It resolves live at request time
(current published template + latest report) rather than freezing a copy, so a re-publish or
report edit is reflected and a revoke is immediate. A frozen point-in-time snapshot would be
the right call once reports are legally-versioned documents; that's noted below.

## Report editing as validated JSON

`ReportData` is a large, deeply-nested domain object. Rather than build (and maintain) a
bespoke form for every field, report create/edit is a single JSON editor validated against
`ReportDataSchema` before save. It keeps the data/presentation split honest (you edit domain
data, the template decides rendering) and is the realistic shape of an integration boundary —
in production this endpoint is fed by an upstream system, not typed by hand. A guided form is
a straightforward future addition on top of the same schema.

## Editor UX: undo/redo + live validation

Undo/redo is a small past/present/future reducer over the `{ name, config }` draft (no
library — the state is small and bespoke). Live validation runs the shared
`TemplateConfigSchema` on every keystroke and blocks Save/Publish while invalid, so the
server's Zod rejection is a backstop, not the first signal a clinician sees.

## Runtime dependencies — chosen deliberately, not by default

The first pass was intentionally dependency-free. On review feedback ("more robust editing,
higher-value features") three libraries were added where hand-rolling was measurably worse —
each earns its place; the guiding rule was *right tool, not more tools*:

- **`@dnd-kit`** for section reordering. The native HTML5 DnD it replaced had no keyboard
  support, no touch, and poor screen-reader semantics — unacceptable for a clinical tool.
  dnd-kit gives keyboard dragging, touch, and ARIA live-region announcements out of the box.
- **`react-hook-form` + `@hookform/resolvers` (zod)** for report editing. A raw-JSON textarea
  is honest but reads as a placeholder; a schema-driven form with add/remove field arrays for
  goals, plan, timeline, coach and biomarker tables is the real "content" upgrade. The
  resolver reuses the *same* `ReportDataSchema`, and fields not rendered pass through
  untouched — so the form and the (retained) "Advanced JSON" tab are two views of one schema.
- **`sonner`** for toast feedback on save/publish/share instead of scattered inline banners —
  a small, focused polish dependency.

Deliberately *not* added: date/utility lib(date-fns, lodash) and any UI kit (MUI/AntD) — the
brief calls for plain Tailwind, and those would add weight without matching value.

## Tenant isolation

- One middleware resolves `X-Clinic-Slug` → clinic row; missing/unknown → 401.
- Every query and mutation includes `clinicId` in its `where` (`findFirst({ id, clinicId })`
  rather than `findUnique({ id })`), including the `?templateId=` preview override and
  `duplicateOf` source lookups.
- Cross-tenant hits return the **same 404 as a nonexistent id** — an attacker cannot even
  learn that a resource exists.
- Client-side, TanStack Query keys are prefixed with the clinic slug so switching clinics
  can never serve cached cross-tenant data.

In production this would be a real principal (session/JWT) resolving to clinic membership,
with the same scoping discipline — ideally enforced by row-level security or a
tenant-scoped Prisma client extension instead of per-route vigilance.

## Patient safety: mandatory sections

`MANDATORY_SECTIONS = ['header']` — a report without patient identity, dates and author is
a clinical document hazard (wrong-patient risk). And `coach.includeSafety` cannot be false
while coach is enabled: the safety block carries contraindications, monitoring duties and
the "call us right away" escalation criteria for medications. A clinic hiding that to make
a prettier report creates real harm, so the rule lives in **both** places: the Zod schema
(server rejects the save — covered by tests) and the editor UI (toggle disabled with an
explanation). Belt and suspenders, because only the server-side check is a guarantee.

Judgment calls made here (simpler-option rule):

- Mandatory means *cannot be disabled if present*. `BLANK_TEMPLATE` is specified as
  `sections: []`, so "must always be present" would contradict it; instead the renderer and
  API tolerate header-less configs, and clinics building from blank add the header
  themselves.
- `includeSafety: false` is tolerated on a fully **disabled** coach section (clinic B
  disables coach entirely) — hiding a whole section is a template choice; hiding safety
  *within* shown medication guidance is the hazard.

## Other judgment calls

- **Reference PDF absent** from `./reference` at build time — data model and section order
  were built from the spec's own description, values invented in its spirit.
- Editor supports **add/remove section** (not just enable/reorder): required for blank
  templates to be editable at all. Removal is blocked for mandatory types.
- `eatAvoid` renders with the `whatToDo` field group (it has no own toggle in the specified
  options union).
- Prisma 5 is pinned because the local Node runtime (18.16) predates Prisma 6's floor;
  SQLite on Prisma 5 lacks `Json` columns, so JSON lives in `String` columns validated by
  the shared schemas at the boundary.
- Custom text renders a **safe markdown subset** via a ~60-line parser instead of a
  markdown dependency — clinic text is untrusted input; no raw HTML ever.

## Delivered in the enhancement round

Draft/publish + version history + rollback, an append-only audit/activity log, per-patient
template assignment, public read-only share links, patient & report CRUD, print view, and the
editor upgrades (accessible drag-and-drop, undo/redo, live validation, JSON import/export,
richer theme, a schema-driven report form, and toast feedback). These were previously on the
cut list; the remaining gaps below are the honest next tier.

## Still cut for scope — what production needs

- **Real auth/RBAC**: sessions/OIDC, clinic membership, roles (admin edits/publishes,
  clinicians only render), per-patient access control and BAA-grade audit of PHI access. The
  audit log records an `actor`, but it's the clinic slug today, not an authenticated user.
- **Optimistic concurrency**: two editors publishing the same template can clobber each other
  — the `version` counter is the hook for an `If-Match`/conflict check, not yet enforced.
- **Frozen share snapshots + guided report form**: share links resolve live; legally-
  versioned patient documents want a point-in-time freeze. Report editing is raw JSON; a
  schema-driven form is the next step.
- **Template migration strategy as `ReportData` evolves**: schema-version registry with
  stepwise migrations (v1→v2→…) applied lazily on read and persisted on write; renamed
  section types kept as aliases; a CI contract test that every stored template + published
  snapshot parses against the current schema before deploy.
- **i18n**: all section titles/labels through a message catalog; per-clinic locale; RTL.
- **PDF output**: the print view is step one; headless-Chromium rendering of the same React
  report (one renderer, two media) is the natural next step — never a second template system.
- **Accessibility**: semantic table/heading audit, contrast-checking clinic-chosen accents
  (compute + clamp), full keyboard/AT pass over the editor and the drag-and-drop.
- Plus: pagination, rate limiting, structured logging/observability, Postgres with native
  `jsonb`, and share-link analytics.
