
# Multi-tenant patient report templates

Each clinic (tenant) owns its report templates; a patient's report is domain data
(`ReportData`) rendered through the clinic's saved template (`TemplateConfig`).
Web views only — no PDF parsing or generation.

## Stack

- `apps/server` — Node + Express 4 + Prisma + SQLite (data survives restarts)
- `apps/web` — React 18 + Vite + TypeScript + Tailwind + React Router + TanStack Query
- `packages/shared` — Zod schemas + types shared by both (`ReportData`, `TemplateConfig`, DTOs)

There is no auth provider: the frontend picks a clinic on the home screen (persisted in
`localStorage`) and sends it as an `X-Clinic-Slug` header. The server scopes every query by
the resolved clinic; cross-tenant access answers **404, never data**.

## Prerequisites

- **Node 20** (the toolchain is pinned to also run on Node ≥ 18.16)
- **pnpm 9** (`corepack enable` or `npm i -g pnpm@9`)

## Run it

```bash
pnpm i
pnpm db:push   # create the SQLite schema (apps/server/prisma/dev.db)
pnpm seed      # 2 clinics, 2 templates, 4 patients, 4 reports — this IS the demo
pnpm dev       # server on :3001 + web on :5173 (Vite proxies /api)
```

Open http://localhost:5173.

```bash
pnpm test        # ~33 tests: API/isolation/publish/versioning/CRUD/sharing (supertest),
                 #            schema + renderer (jsdom)
pnpm typecheck   # tsc --noEmit in every package
pnpm lint
```

## Features

Report rendering & templates
- Template-as-data (`TemplateConfig`): ordered sections with per-type options as a Zod
  **discriminated union**, rendered through a `Record<SectionType, Component>` registry.
- Per-clinic independence, full tenant isolation (`X-Clinic-Slug`; cross-tenant → 404).
- Forward-compatible configs (unknown options preserved, missing ones defaulted, unknown
  section types skipped, per-section error boundaries).

Robust editing
- **Drag-and-drop** section reordering, duplicate/remove section, add any section type.
- **Undo / redo** (buttons + ⌘Z / ⌘⇧Z), **live schema validation** that blocks Save/Publish.
- **Import / export** a template as JSON; **richer theme** (accent + secondary accent, font,
  font size, density, brand name) that visibly changes the live preview.

Versioning & workflow
- **Draft vs Published**: the editor edits a draft; patient reports render the *published*
  config. **Publish** snapshots a version; **version history** with preview + **rollback**.
- **Activity log**: an append-only audit trail (edits, publishes, patient/report/share
  changes), scoped per clinic.

Data management
- **Patient CRUD** and **report editing** (validated `ReportData` JSON), **per-patient
  template assignment** (falls back to the clinic default), search on lists.

Sharing & output
- **Public read-only share links** (unguessable token, optional expiry, revoke) at
  `/share/:token` — no login, pinned template. **Print-optimized** report view.

## Demo walkthrough — per-clinic independence + the workflow, in 7 steps

1. **Doron Health, full report.** Pick *Doron Health* → *Patients* → *Marcus Ellison* →
   *Report*. The full report renders: blue accent, comfortable spacing, all sections —
   health status, story, 8 goals with metric tables, plan, orders, timeline, coach cards
   (including the red medication-safety block), and the 14-category biomarker deep dive.

2. **Northside Longevity, same data, different template.** *Switch clinic* → *Northside
   Longevity* → open *Marcus Ellison* there (the seed gives clinic B a patient with the
   **same report data**). Same numbers, but: emerald accent, serif, compact; **no story,
   no coach**; only **3** goals; deep dive shows **only abnormal biomarkers** with just
   *value / reference range / date*; a clinic disclaimer closes the report. Only the
   template changed.

3. **Robust editing.** *Templates* → open one. **Drag** sections to reorder, **duplicate**
   a section, tweak theme (try a secondary accent + brand name) — the right pane updates
   live. Break something (e.g. paste bad JSON via **JSON**) to see live validation; **undo**
   with ⌘Z. The header toggle and coach *medication safety* are disabled (enforced
   server-side too).

4. **Draft vs publish.** Edit the config and **Save draft** — open the patient report: it is
   *unchanged* (still the published version). Back in the editor, **Publish** (add a note) —
   now the report reflects it. The status pill and the templates list show
   *unpublished changes* → *Published vN*.

5. **Version history + rollback.** In the editor's *Version history*, **Preview** a prior
   version in the right pane, then **Restore to draft** and Publish to roll back.

6. **Patients, reports & assignment.** *Patients* → *New patient*, then *Add report* (JSON,
   validated). **Edit** a patient to assign a specific template — the report header shows
   *patient-assigned template*. Everything you did shows up under **Activity**.

7. **Share & print.** On a report, **Share** → create a link → open `/share/:token` in a
   private window (no login) to see the read-only patient view; **Revoke** kills it. **Print**
   renders a clean document. Switch back to *Doron Health* to confirm its templates are
   untouched — clinic B never sees clinic A's data (covered by tests).

## Assumptions

- Clinic A's full report is modeled faithfully on the reference report in `./reference`
  (same sections/order, 8 goals, 7 coach cards, 14 deep-dive categories, values transcribed
  from it). The patient is synthetic (fake name); clinic B reuses the same data to make the
  template difference obvious.
- **Draft/publish:** the editor edits a *draft*; patient reports render the *published*
  config. A template with no published version yet falls back to its draft so reports still
  render. Publishing with no changes is a 409.
- **Per-patient template:** a patient may be assigned a specific template; otherwise the
  report uses the clinic default, then `BASE_TEMPLATE` as a last resort. The `?templateId=`
  query is a preview override on top of that.
- **Share links** are read-only snapshots resolved at request time (they reflect the current
  published template + latest report), authenticated only by an unguessable token, with
  optional expiry and revocation.
- Report editing and creation are exposed as **validated `ReportData` JSON** (one power-user
  editor) rather than a bespoke form per field — the domain object is large and this keeps
  the data/presentation split honest.
- "Mandatory section" means a mandatory type **cannot be disabled if present**; the
  BLANK_TEMPLATE is genuinely empty (as specified), so the editor also supports adding and
  removing sections — otherwise blank templates would be uneditable.
- `coach.options.includeSafety` must be `true` whenever the coach section is **enabled**;
  a fully disabled coach section is allowed (clinic B does exactly that).
- One report per patient; the endpoint serves the latest by `generatedDate`.
- Newly created templates are never auto-default. If a clinic somehow has no default, the
  report endpoint falls back to `BASE_TEMPLATE` rather than failing.
- Prisma 5 + SQLite has no `Json` column type, so `Report.data` / `Template.config` are
  `String` columns validated with the shared Zod schemas at the route boundary.
- `custom_text` supports a small safe markdown subset (headings, lists, bold/italic/links);
  raw HTML is intentionally not rendered.
- BASE_TEMPLATE includes `custom_text` (enabled, empty) so "every section" is literally true;
  the renderer hides it until a clinic writes content.

No secrets, no network calls at runtime — everything works offline once installed.
