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

## Cut for scope — what production needs

- **Real auth/RBAC**: sessions/OIDC, clinic membership, roles (admin edits templates,
  clinicians only render), per-patient access control and BAA-grade audit of PHI access.
- **Draft/publish + audit log**: template edits currently apply instantly to live patient
  reports. Production wants draft → preview → publish, an immutable version history of who
  changed what, and rollback.
- **Template migration strategy as `ReportData` evolves**: schema-version registry with
  stepwise migrations (v1→v2→…) applied lazily on read and persisted on write; renamed
  section types kept as aliases; a CI contract test that every stored template parses
  against the current schema before deploy.
- **i18n**: all section titles/labels through a message catalog; per-clinic locale;
  RTL-aware layout.
- **PDF output**: print stylesheet first, then headless-Chromium rendering of the same
  React report (one renderer, two media) — never a second template system.
- **Accessibility**: semantic table/heading audit, contrast checking of clinic-chosen
  accents (compute contrast and clamp), keyboard-only pass over the editor, screen-reader
  labels for the timeline.
- Plus: pagination, optimistic concurrency on template saves (the row version is already
  there), rate limiting, structured logging/observability, Postgres with native `jsonb`,
  and real drag-and-drop reordering in the editor.
