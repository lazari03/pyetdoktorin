# Plan — Pyetdoktorin Enterprise sidebar shell

What needs to be implemented, in order. See `knowledge.md` for the research this is based on.

## Phase 1 — Shell replacement (approved, in progress)

Swap `SectionShell.tsx`'s top pill-nav for a collapsible left sidebar, matching the mockup's look, across all 4 sections (dashboard/admin/clinic/pharmacy) at once — since it's one shared component.

**Only file touched:** `src/presentation/components/SectionShell/SectionShell.tsx`.

- Desktop (`md:` and up): left sidebar — brand wordmark, nav list (icon + label + badge, from existing `renderedNav`), active-item accent highlight, collapse/expand toggle (local state + `localStorage` key `pd_sidebar_collapsed`), bottom user chip opening the existing profile dropdown (`renderedProfileMenu`).
- Content area moves beside the sidebar instead of below a header.
- Mobile (`md:hidden`): unchanged — existing hamburger + full-screen nav list stays as the mobile pattern.
- 2 new locale keys (`collapseSidebar`, `expandSidebar`) added to `src/locales/en.json` and `src/locales/al.json` for the toggle's accessible label. Everything else reuses existing `labelKey`/`fallback` i18n already flowing through `navItems`/`profileMenuItems`.
- No new props, no changes to any `layout.tsx`, `navConfig.ts`, guards, or pages.

**Explicitly excluded (see knowledge.md/plan rationale):**
- No role-switcher tabs (canvas-only preview affordance; would let a user client-side-impersonate another role — security regression).
- No accent-color / density / dark-sidebar-tone settings UI (not a real feature anywhere in the app today; ships with the existing brand purple hardcoded).
- No page-content redesign (KPIs, booking stepper, users split-panel, reports charts) — that's Phase 2, below.

## Phase 2 — Page-level UX upgrades (backlog, NOT started, needs separate confirmation before each)

These are visual upgrades the mockup suggests for specific pages. Each touches real data wiring (stores/use-cases) that Phase 1 research didn't fully map, so each needs its own look-before-you-build pass and a go-ahead before coding:

1. **Admin Users** (`src/app/(app)/admin/users/page.tsx`) — add search input + role-filter pills above the existing `UsersTable`; turn the current stacked create-form-then-table layout into a split view (table + a create-or-detail side panel), reusing `UserSidepanel.tsx` rather than replacing it.
2. **Admin Reports** (`src/app/(app)/admin/reports/page.tsx`) — add KPI summary cards + a top-doctors mini table above the existing reports table, sourced from whatever real reports data/use-case already feeds that page.
3. **Booking flow** (`src/app/(app)/dashboard/new-appointment/**`) — check whether it's already a multi-step flow; if not, add the 4-step stepper visual (doctor → date/time → notes → review).
4. **Per-role dashboards** (patient/doctor/clinic/pharmacy home pages) — KPI cards + activity/requests side list, per mockup, using each page's existing real data sources.

Do not start Phase 2 items until asked — Phase 1 is the confirmed scope for this session.

## Verification (Phase 1)

- Run the repo's lint/typecheck script (check `package.json`) after editing `SectionShell.tsx`.
- `npm run dev`, click through all 4 sections as at least two roles (e.g. Patient + Doctor for `dashboard`, plus admin/clinic/pharmacy): nav items, badges, active-state highlight, logout, profile dropdown all still work.
- Confirm collapse/expand persists across a page reload.
- Confirm mobile hamburger menu still opens/navigates/closes unchanged.
- Confirm `en.json`/`al.json` still valid per `tools/validate-locales.js` after adding the 2 new keys.
