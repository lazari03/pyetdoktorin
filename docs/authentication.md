# Authentication & session handling

How login, sessions, and logout work across the Next.js frontend and Express backend.

## Login flow

1. The user submits credentials on `/login`. The **Firebase Auth SDK** signs them in client-side and stores its tokens in IndexedDB (managed by the SDK — no JS-readable auth cookies exist anywhere).
2. The app POSTs the Firebase **ID token** to `/api/auth/session` (Next.js proxies it to the Express backend — `src/app/api/auth/_lib/backendAuthProxy.ts`).
3. The backend (`backend/src/routes/auth.ts` → `backend/src/services/serverSessionService.ts`) verifies the token with Firebase Admin, reads the user's role from Firestore, syncs custom claims, and mints **three httpOnly cookies**:

| Cookie | Purpose | Attributes |
|---|---|---|
| `session` | Firebase session cookie | HttpOnly, SameSite=Lax, Secure (prod), Max-Age 30 min |
| `userRole` | Role hint | same |
| `lastActivity` | Timestamp | same |

## Authenticating API calls

`src/network/backendClient.ts` (`backendFetch`) attaches credentials in this order:

1. **Bearer ID token** (primary) — pulled from the live Firebase SDK token holder; the SDK auto-refreshes it.
2. **Session cookie** (fallback) — used by the backend's `requireAuth` middleware (`backend/src/middleware/auth.ts`) only when no Bearer header is present, e.g. right after a hard reload before Firebase hydrates.

`requireAuth` also enforces email verification and role-based access per route.

## Session lifetime & idle logout

Managed by `src/store/sessionStore.ts`, started by `SessionActivityHost` in `src/app/(app)/AppProviders.tsx` — **only while the user is authenticated**.

- Mouse/keyboard/scroll/touch activity updates a single localStorage timestamp (`session:lastActivity`), shared across tabs.
- Every 30 s the monitor checks it:
  - **Idle > 30 min** → logout in all tabs, redirect to `/login?reason=idle-timeout`.
  - **Active** → every 10 min it re-mints the server session cookie via `/api/auth/session`, so *activity*, not cookie age, decides when a session ends.
- The video-call page (`dashboard/appointments/video-session`) marks activity every minute, because events inside the 100ms iframe never reach the parent page. Being in a call counts as activity.

Tunables (env, with defaults): `NEXT_PUBLIC_SESSION_IDLE_TIMEOUT_MS` (30 min), `NEXT_PUBLIC_SESSION_COOKIE_REFRESH_MS` (10 min), `AUTH_COOKIE_MAX_AGE_SECONDS` (30 min).

## Logout & redirects

Every way a session can end lands the user on `/login`:

| Trigger | Path |
|---|---|
| Manual logout | `sessionStore.logout` → Firebase signOut + server logout beacon → `/login` |
| Idle 30 min | `logoutForIdle` → `/login?reason=idle-timeout` |
| Visiting an app section while logged out | `useSectionGuard` / `useDashboardGuard` in each layout → `/login?next=<page>` |
| Backend returns 401 mid-session | `backendFetch` signs out Firebase and redirects to `/login?reason=session-expired&next=<page>` (app sections only, fires once) |
| Logout in another tab | Firebase signOut propagates via the SDK → guards redirect |

The login page reads the `next` param, so users return to where they were after re-authenticating.

## Server-side logout

`POST /api/auth/logout` expires all three cookies and writes a security audit log (as does session establishment — see `backend/src/services/securityAuditService.ts`).
