# Knowledge — Pyetdoktorin Enterprise mockup + live-app architecture

Gathered before implementation. Two sources merged: (1) the imported `.dc.html` mockup spec, (2) a map of the live app's actual architecture.

## 1. Mockup spec (`Pyetdoktorin Enterprise.html`)

Format: a Claude-Design canvas bundle (self-extracting HTML wrapping a gzip+base64 `dc-runtime` template + a single JS class `Component extends DCLogic` holding all state/logic). Fake data throughout (hardcoded DOCTORS/APPTS/USERS arrays) — a visual/UX reference only, not code to lift directly.

### Roles & nav
5 roles: patient, doctor, clinic, pharmacy, admin. Each has its own sidebar nav (4–5 items, icon + label + optional badge count). A sidebar-footer "role switcher" (P/D/C/Rx/A tabs) lets the canvas preview all 5 roles in one place — **canvas-only affordance, not a real feature** (see plan.md exclusions).

### Sidebar & theming
- Collapsible: 244px expanded ↔ 66px collapsed, 0.22s transition, icons-only when collapsed.
- Theming props: `accent` (default `#7c3aed`), `sidebarTone` (`light`/`dark`), `density` (`compact`/`comfortable`) — all canvas preview knobs, injected as CSS vars (`--acc`, `--acc-soft`, `--acc-border`, `--pad`, `--gap`, `--cardpad`, `--fs`).
- Active nav item: accent-tinted background + inset left border in accent color.

### Screens
- **Patient dashboard**: 4 KPI cards (upcoming visits, prescriptions, total visits, pending actions) each with icon/delta/sparkline; hero "next consultation" card (gradient, doctor info); 4 quick-action buttons; recent-appointments table; activity feed; recent doctors list.
- **Patient appointments**: filter pills (All/Upcoming/Past/Canceled) + full table (doctor, type, date/time, status badge, payment badge, action).
- **Booking flow**: 4-step stepper (Choose doctor → Date & time → Details → Review). Step 0: doctor list w/ rating + availability. Step 1: appointment-type chips + date input + time-slot grid. Step 2: notes textarea. Step 3: review summary. Back/Continue nav.
- **Doctor/Clinic/Pharmacy home**: role-specific 4 KPI cards + a two-column body (schedule/bookings/inbox list on the left, a supporting sidebar list — requests/room-status/low-stock — on the right).
- **Admin Reports**: 4 KPI cards, 6-month bar chart, role-split legend (patients/doctors/clinics/pharmacies), top-doctors mini table, filterable reports table.
- **Admin Users**: search input + role filter pills + "New user" button: table (avatar, name, email, role badge, status badge, joined, appt count); right-hand panel with 3 states — empty / create (role chips + form) / detail (full user info + edit/delete).
- **Generic placeholder screens**: shared template (icon + title + subtitle + "lives in the same shell" callout) used for anything not fully mocked (Prescriptions, Private clinics, Notifications, Security logs, Blog, Calendar, Availability, etc.)

### State shape (mockup only, not to be copied verbatim)
```
role, screen, collapsed,
step, doctorId, apptType, date, time, notes,
apptFilter, reportFilter,
userSearch, userRoleFilter, panel, selectedUserId, createRole,
genericKey, genericLabel
```

### Palette used
Accent purple `#7c3aed`; success/confirmed green (`#dcfce7`/`#15803d`); pending amber (`#fef3c7`/`#b45309`); completed cyan (`#e0f2fe`/`#0369a1`); error/canceled red (`#fee2e2`/`#b91c1c`).

## 2. Live app architecture (`alo_dok`)

### Nav config — `src/navigation/navConfig.ts`
- `NavItemDef = { key, href, labelKey, fallback }`
- `MenuEntryDef` = union of `{kind: 'link'|'divider'|'action', ...}`
- `getDashboardNavDefs(role)` / `getDashboardProfileMenuDefs(role)` — role-aware (Doctor vs Patient), used by `dashboard` section.
- `getAdminNavDefs()` / `getAdminProfileMenuDefs()`, `getClinicNavDefs()` / `getClinicProfileMenuDefs()`, `getPharmacyNavDefs()` / `getPharmacyProfileMenuDefs()` — constant per section (single role each).

### Guards — `src/navigation/useDashboardGuard.ts`, `useSectionGuard.ts`
- `useDashboardGuard({loading, isAuthenticated, role, pathname})`: redirects unauthenticated → login; wrong-role-for-dashboard → their landing page.
- `useSectionGuard({..., allowedRole})`: single-role sections (admin/clinic/pharmacy), redirects anyone else to their own landing page.
- Paths centralized in `src/navigation/paths.ts` (`DASHBOARD_PATHS`, `ADMIN_PATHS`, `CLINIC_PATHS`, `PHARMACY_PATHS`).

### Roles — `src/domain/entities/UserRole.ts`
```ts
enum UserRole { Doctor='doctor', Patient='patient', Admin='admin', Pharmacy='pharmacy', Clinic='clinic' }
```
Provided via `useAuth()` (`src/context/AuthContext.tsx`) → `{ isAuthenticated, uid, user, emailVerified, role, loading }`, normalized server-side — never client-chosen.

### i18n — `src/locales/{en,al}.json` (+ `.ts` wrappers)
Flat key structure (no deep nesting). Components call:
```ts
const { t } = useTranslation();
t('someKey', { defaultValue: 'Fallback text' })
```
`tools/validate-locales.js` only checks JSON validity, not key parity between locales — still add keys to both files by convention.

### Shell — `src/presentation/components/SectionShell/SectionShell.tsx`
Single shared shell for all 4 sections. Renders: mobile top bar + hamburger + full-screen slide-down nav; desktop sticky header with purple gradient, `AppWordmark`, pill-style nav buttons, profile dropdown (`renderedProfileMenu`, built from `profileMenuItems` via `menuIcon()`). All 4 `layout.tsx` files (dashboard/admin/clinic/pharmacy) wire it identically — only the guard and nav-def builder differ per section.

### Reusable components
- `GenericTable`, `AppointmentsTable` (+ `types.ts`) — table primitives already in use.
- `Modal`, `Toast/ToastProvider` (+ page-local `admin/components/ToastProvider.tsx`), `RoleGuard`, `MissingRole`, `Loader`.
- `presentation/ui/`: `Button`, `Card`, `Input`, `Textarea`, `cn` (className util).
- `app/(app)/admin/components/`: `UsersTable.tsx`, `UserSidepanel.tsx` (real, stateful, wired to `adminStore`).
- Note: `presentation/components/DashboardShell/` and `DashboardSidebar/` are **empty placeholder directories** — dead, unused. The real dashboard wrapper is `src/app/components/DashboardShell.tsx` (trivial `min-h-screen` div).

### Existing real pages (already functional, not mocks)
- `dashboard/**`: home, appointments (+ journey, video-session), clinics (+ history), doctor/[doctorId], doctor/availability, doctor/calendar, earnings, myprofile, new-appointment, notifications, pay, reciepe(s), search, upcoming-requests.
- `admin/**`: home, users, notifications, reports (+ [appointmentId] detail), security, profile, blog.
- `clinic/**`: home, calendar, bookings, profile, notifications.
- `pharmacy/**`: home, reciepes, profile, notifications.

### Styling tokens
`tailwind.config.js`: `primary #7c3aed` (purple-600, brand), `secondary #dbf544`, `purple.DEFAULT/light/dark`, `teal`, `ocean`, `cloud`. `globals.css`: `--surface`, `--surface-muted`, `--border`, `--shadow-soft/card`, `--radius-card: 1.5rem`, `.card`/`.card-premium` utilities, `--app-page-gradient`.

## 3. Conclusion driving the plan
`SectionShell.tsx`'s props already cover everything a sidebar needs, and every consumer (4 layouts, every page) only depends on that prop contract — so the nav-paradigm swap can be done as an in-place rewrite of one file, with zero blast radius elsewhere. See `plan.md`.
