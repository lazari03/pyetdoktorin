# Progress — Pyetdoktorin Enterprise sidebar shell

- [x] Import mockup (`Pyetdoktorin Enterprise.html`), unpack `.dc.html` bundle, extract full screen/state spec.
- [x] Map live-app architecture (nav config, roles, i18n, shell, reusable components, existing pages, styling tokens).
- [x] Confirm scope with user: full shell replacement (top pill-nav → collapsible left sidebar), everywhere.
- [x] Write `knowledge.md`, `plan.md`, `progress.md`.
- [x] Rewrite `SectionShell.tsx` internals to a collapsible left sidebar (Phase 1).
- [x] Add `collapseSidebar`/`expandSidebar` locale keys to `en.json` + `al.json`.
- [x] Manual verification pass (4 sections, 2+ roles, collapse persistence, mobile nav, locale validation).
- [x] Phase 2 (page-level upgrades) — complete:
  - [x] Admin Users — search + role-filter pills + split create panel (`admin/users/page.tsx` + `UsersTable.tsx`)
  - [x] Admin Reports — top-doctors mini table derived from appointments (`admin/reports/page.tsx`)
  - [x] Booking flow — 4-step stepper already fully implemented in `NewAppointmentStepper.tsx`
  - [x] Per-role dashboards — all roles already have KPI cards + activity feeds (patient/doctor hero+earnings+visits, clinic bookings+earnings, pharmacy stat cards+inbox, admin KPIs+users)
