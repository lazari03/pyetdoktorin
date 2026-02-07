# Production Readiness Plan

This document outlines how to evolve the Alo Doktor web application into a production-ready platform with a dedicated backend layer. It serves as the foundation for subsequent implementation work.

## 1. Current Architecture Snapshot

- **Frontend**: Next.js (App Router + legacy pages), client-heavy Firebase interactions.
- **Auth**: Firebase Authentication; Next.js API route `/api/auth/session` issues cookies.
- **Data**: Firestore accessed directly from the client, with Firestore rules guarding access.
- **Payments**: PayPal (create/capture) triggered from the client.
- **Admin tooling**: Next.js API routes for user provisioning, no centralized audit log.

## 2. Target Architecture

Introduce a backend layer (can be implemented as Next.js API routes or a separate Node service) that owns all sensitive flows.

### Backend Responsibilities

1. **Session & Auth**
   - Verify Firebase ID tokens, issue signed HTTP-only session cookies.
   - Rotate/refresh tokens and store session metadata (IP, UA, expiry).
   - Enforce RBAC centrally (admin/clinic/pharmacy/doctor/patient).

2. **User Management**
   - Admin endpoints to create/update/delete users of any role.
   - Reset passwords, approve doctors, manage clinic/pharmacy metadata.
   - Audit logging for every change.

3. **Appointments & Prescriptions**
   - CRUD operations behind authenticated APIs.
   - Server-side validation of payloads, enforce invariants (e.g., patient owns appointment).

4. **Clinic Bookings**
   - Accept booking requests from patients, queue for clinics.
   - Provide admin/clinic dashboards via backend queries.

5. **Payments & Payouts**
   - Server-owned PayPal integration (create/capture).
   - Record transactions, doctor payouts, refund hooks.

6. **Notifications & Analytics**
   - Centralized event logging.
   - Hooks for email/SMS/push providers.

### Client Responsibilities

- Render UI, call backend APIs via fetch/Axios with credentials.
- Store minimal derived state; no direct Firestore access.

## 3. Phased Rollout

| Phase | Scope | Deliverables |
|-------|-------|--------------|
| 1 | Session hardening | Backend session service, cookie issuance, RBAC middleware |
| 2 | User management APIs | Admin create/update/delete endpoints; client integration |
| 3 | Payments & payouts | Secure PayPal APIs, transaction ledger |
| 4 | Appointments & prescriptions | Backend CRUD, validation, logging |
| 5 | Clinic bookings | Server-managed booking queue/workflows |
| 6 | Monitoring & deployment | Structured logging, error tracking, CI/CD pipeline |

## 4. Immediate Next Steps

1. **Finalize backend stack choice** – ✅ We now run a standalone Express service under `/backend`. Decide later whether to fold it into Next.js middleware or keep it independent.
2. **Implement session service** – ✅ `backend/src/services/serverSessionService.ts` issues signed cookies once Firebase auth succeeds. `/api/auth/session` now proxies through the backend.
3. **Abstract Firestore access** – ✅ Users, appointments, prescriptions, clinics, payments, and notifications now go through backend routes. A quick `grep -R 'firebase/firestore' src` should stay empty on the frontend.
4. **Refactor frontend** – ✅ Admin lists, dashboards, prescriptions, pharmacy views, and notifications call the backend via `backendFetch`. Continue sweeping smaller hooks to remove legacy DI usage.
5. **Add logging/metrics** – 🔄 Still pending. Backend currently uses `morgan` + console logs; we need structured logging (e.g., Winston) and monitoring hooks.
6. **Document deployment** – ✅ Backend README + `docs/backend-deployment.md` include env vars, commands, and hosting guidance. Next step is CI/CD + secret rotation.

This plan will evolve as each phase is completed. Subsequent commits will implement the backend APIs, client migrations, and deployment tooling described here.
