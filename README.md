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
pnpm test        # ~21 tests: API + tenant isolation (supertest), schema + renderer (jsdom)
pnpm typecheck   # tsc --noEmit in every package
pnpm lint
```

## Demo walkthrough — per-clinic template independence in 5 steps

1. **Doron Health, full report.** Pick *Doron Health* → *Patients* → *Marcus Ellison* →
   *View report*. You see the full report: blue accent, comfortable spacing, all sections —
   health status, story, 4 goals with metric tables, plan, orders, timeline, coach cards
   (including the red medication-safety block under Metformin), full biomarker deep dive.

2. **Northside Longevity, same data, different template.** Click *Switch clinic* → pick
   *Northside Longevity* → open *Marcus Ellison*'s report there (the seed gives clinic B a
   patient with the **same report data**). Same patient, same numbers — but now: emerald
   accent, serif, compact; **no story, no coach**; only **3** goals; the deep dive shows
   **only abnormal biomarkers** with just *value / reference range / date* columns; and a
   clinic disclaimer block appears at the end. Nothing about the patient changed — only the
   clinic's template did.

3. **Edit with live preview.** Still in Northside: *Templates* → *Northside Concise Report*.
   Left panel: toggle sections, reorder with ▲▼, override titles, change per-type options,
   pick another accent/density. The right pane re-renders a real seeded report with your
   unsaved config instantly. Note the header toggle and the coach *Include medication safety*
   box are disabled — those are enforced server-side too. Hit *Save* (version bumps), then
   check the patient report: it follows the default template.

4. **Create / duplicate / set default.** In *Templates*, create a template *from base* or
   *blank* (or *Duplicate* an existing one), edit it, then *Set default*. Patient reports
   switch immediately. On the report page you can also preview any template via the
   *Template* dropdown (`?templateId=`) without changing the default. Deleting the default is
   blocked with an explanation (409 on the API).

5. **Prove isolation.** Switch back to *Doron Health*: its template list is untouched and
   Marcus's report still renders the full blue layout. Clinic B never sees or edits clinic
   A's templates — requesting another clinic's template id returns 404 (covered by tests).

## Assumptions

- The reference PDF was not present in `./reference` at build time; the data shape and
  section list were built from the task spec, with invented values in the spirit of the
  reference case (fasting insulin 27.8 µIU/mL, TG 187, HDL 39, LDL 101, A1c 5.5%, eGFR 66,
  creatinine 1.33, estradiol 53). All patients are synthetic.
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
