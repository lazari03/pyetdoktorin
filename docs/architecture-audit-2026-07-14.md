# Architecture, dead-code, i18n & data-loading audit — 2026-07-14

Scope: full `src/` (Next.js frontend) and `backend/src/` (Express backend). Read-only findings plus a log of what was fixed in this same pass. Generated via targeted codebase agents; verify file:line references still hold before acting on anything not already marked done.

## Overall verdict

The app is in noticeably good shape for a project this size: **no dead buttons with empty/no-op handlers were found in any live, reachable UI**, and **no mock/fake data was found standing in for real backend data anywhere** — every KPI card, table, and stat widget traced back to a real use case or store. The issues that do exist are narrower: a handful of un-localized strings, a few clean-architecture layering shortcuts, one dead component, and a data-loading pattern that fetches per-component rather than centrally.

---

## 1. Fixed in this pass

- **`GET /api/user-notifications` 500 error** — `backend/src/services/userNotificationsService.ts` had a Firestore query combining `where('userId','==',x)` with `.orderBy('createdAt','desc')`, which requires a composite index that was never deployed (no `firestore.indexes.json`/Firebase CLI auth available in this environment). Fixed by dropping `orderBy` from the query and sorting in memory instead (`listUserNotifications`, `getArchiveForUser`) — per-user notification volume is small enough that this is cheap, and it removes an infra deploy dependency entirely.
- **i18n**: added `useTranslation`/`t()` to `DoctorKpiCards.tsx`, `PatientKpiCards.tsx`, `SignaturePad.tsx`, all 6 files in `presentation/components/Skeleton/`, `Pager.tsx`, plus fixed hardcoded strings in `dashboard/layout.tsx` ("New appointment"), `admin/users/page.tsx` ("Close panel", "Email"), `admin/reports/page.tsx` ("Users by role", "Top doctors"), and `SectionShell.tsx` ("OVERVIEW", "Primary navigation", "Open profile menu" ×3). All new keys added to both `src/locales/en.json` and `src/locales/al.json`.
- **Real bug found while localizing**: `blogCtaTitle`/`blogCtaSubtitle` were defined **twice** in both locale files with different copy — the blog listing page (`blog/page.tsx`) and the blog post page (`blog/[slug]/page.tsx`) both read the same key, so the second definition ("Book a Doctor Visit Today") silently won for both, and the listing page's intended copy ("Want a personalized demo?") was dead. Fixed by renaming the listing page's pair to `blogListCtaTitle`/`blogListCtaSubtitle` and updating `blog/page.tsx` to use them — restores the two pages' originally-intended distinct copy.
- **Deleted dead code**: `src/presentation/components/heroSection/heroSection.tsx` (unreferenced anywhere; contained 3 buttons — mic/camera/end-call — with no `onClick` at all) and `src/presentation/components/dashboard/DailyHealthTip.tsx` (0-byte empty file).

## 2. Remaining i18n gaps (not yet fixed — lower traffic / larger diff)

- **`src/app/(app)/admin/blog/page.tsx`** — the blog editor page is mostly hardcoded English despite having a few `t()` calls (category/status/author). Representative lines: 127 (`confirm(...)`), 146/149/153 (headers/back link), 161-290 (form labels: Title, Slug, Keywords, Excerpt, Content, Publish/Save Draft/Cancel), 319-337 (page header + Total/Published/Drafts), 389/397 (Edit/Delete). This is the single largest remaining pocket of hardcoded copy in the audited scope — worth a dedicated pass since it's ~20+ strings in one file.
- **Pre-existing duplicate locale keys in `en.json` only** (not touched in this pass — each needs the same "check both usages before merging" treatment as the blog CTA fix above): `passwordResetEmailSent`, `confirmPassword`, `cancel`, `howItWorks`. `al.json` has no duplicates. Worth a follow-up pass to check whether any of these have the same "two different features silently sharing one key" bug as `blogCtaTitle` did.
- Orphaned/unused locale keys noticed in passing (harmless, just dead weight): `comingSoonTitle`, `adminNotificationsPlaceholder`.

## 3. Dead code inventory

- **Deleted**: `heroSection.tsx`, `DailyHealthTip.tsx` (see §1).
- **Still present but unreferenced anywhere in `src/app`** (not deleted — each accepts props and has no embedded fake data, so leaving them is low-risk, but they're dead weight): `EmergencyCard.tsx`, `BmiCalculatorCard.tsx`, `ActivityCard.tsx`, `MetricTiles.tsx`, `UpcomingList.tsx` (all in `src/presentation/components/dashboard/`). Recommend either wiring these into a dashboard page or deleting them in a follow-up — not done here since it wasn't verified whether they're intentionally held for near-term use.

## 4. Clean-architecture layering violations (frontend: domain → application → infrastructure → presentation, wired via `DIContext`)

Not fixed in this pass — flagged for a dedicated refactor since some of these are load-bearing (removing them touches auth/logout flows).

- **Components/stores bypassing `useDI()` and calling the network directly**:
  - `src/store/sessionStore.ts:10-22` (`bestEffortServerLogout`) — calls `navigator.sendBeacon`/`fetch('/api/auth/logout')` directly, in parallel with the proper `LogoutServerUseCase`. Two code paths do the same logout.
  - `src/presentation/components/contact/contact.tsx:18`, `CookieConsentBanner.tsx:83,120`, `src/app/(website)/contact/ContactForm.tsx:33` — direct `fetch` calls (marketing-site scope, lower priority).
  - `src/app/(app)/dashboard/appointments/video-session/page.tsx:60` — direct `fetch`.
- **Server Components importing infra services directly** (unavoidable today since `useDI()` is client-only, but worth noting as a coupling point): `src/app/(website)/blog/page.tsx:7`, `blog/[slug]/page.tsx:10-13` import `@/infrastructure/services/blogServiceServer` directly.
- **Duplicated presentation logic** instead of one shared helper: appointment action → label/icon/disabled-state mapping is independently reimplemented in `AppointmentSummaryCard.tsx:41-85`, `AppointmentsTable.tsx` (~91-252), and `AppointmentTimeline.tsx` (~35-80).
- **Backend routes with business logic/Firestore access embedded directly instead of delegating to `backend/src/services/*`**: `backend/src/routes/users.ts` (lines 182-478), `backend/src/routes/stats.ts` (66-180), `backend/src/routes/paddle.ts` (45-120, includes a Firestore transaction inline), `backend/src/routes/notifications.ts` (19-69, inline IDOR checks), `backend/src/routes/clinics.ts:54-55`, `backend/src/routes/auth.ts:84-145`. Clean counter-examples that DO follow the intended pattern: `appointments.ts`, `doctors.ts`, `availability.ts`, `prescriptions.ts`, `blog.ts`, `securityLogs.ts`, and the new `userNotifications.ts` added this session.

## 5. Data-loading pattern (today) — informs the centralization request

**There is no single global data-loading point beyond `AuthContext`**, which fetches a basic user record (`uid/name/email/phoneNumber/role`) once per auth-state change via `authService.observeFullAuthState`. Everything else is fetched **per-hook-per-page** via component-local `useEffect`s:

| Data | Fetched independently by |
|---|---|
| Full user profile (about, specializations, timezone…) | `useMyProfile.ts` — overlaps with `AuthContext`'s lighter user record, different use case (`getUserProfileUseCase`), fetched separately |
| Profile-completeness flag | `userDashboardViewModel.ts` via `checkProfileCompleteUseCase` — a *third* independent profile-domain fetch |
| Appointments | `useAppointmentStore` (Zustand) — the closest thing to a shared store today, but still triggered independently by `dashboard/page.tsx`, `admin/reports/page.tsx`, `admin/reports/[appointmentId]/page.tsx`, and `dashboard/appointments/journey/page.tsx`, each in their own `useEffect`. The store has in-flight dedup logic (`appointmentStore.ts:76`) — itself an acknowledgment that the current pattern invites redundant simultaneous calls. |
| Notifications | `SectionShell.tsx` (wraps every authenticated page) fetches on every mount via `listUserNotificationsUseCase`, independent of page content |
| Specializations (quick-match) | `QuickAppointmentCard.tsx` fetches its own on mount |
| Admin stats / clinic bookings | `useAdminDashboardStats.ts` / `useClinicBookings.ts` — one-off hooks per page |

**Recommendation for the centralization work you asked for** (not implemented in this pass — this is a cross-cutting refactor that touches `AuthContext`, `useMyProfile`, `userDashboardViewModel`, and `SectionShell`, and deserves its own reviewed change rather than being bundled into an audit-triggered pass):

1. Collapse the 3 independent profile-domain fetches (`AuthContext`, `useMyProfile`, `checkProfileCompleteUseCase`) into one fetch at login, exposed via context, with `useMyProfile` becoming a reader instead of a fetcher.
2. Keep truly need-on-demand data fetched on the spot (notifications unread count, availability slots, doctor search) — these are correctly excluded from "load at login" since they're either real-time-ish or user-input-driven, matching your own callout ("do not make them on the spot unless required such as notifications").
3. Lift page-scoped hooks (`useAdminDashboardStats`, `useClinicBookings`) to fetch once at their layout/route level rather than re-running on every component mount within that page.
4. `useAppointmentStore`'s existing dedup logic is a good sign the store itself is the right shared layer — the fix is routing all consumers through one top-level fetch (e.g. in `dashboard/layout.tsx`, which already calls `useInitializeAppointments`) rather than each page re-triggering it.

This was scoped rather than implemented because it's a genuine architecture change across several files that are all currently working — worth a follow-up task with its own review pass rather than folding into this audit.
