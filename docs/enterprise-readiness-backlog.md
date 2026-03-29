# Enterprise Readiness Backlog

Future scope beyond the current production-ready target.

This document turns the current enterprise-readiness gaps into a concrete implementation backlog for this repository.

It is intentionally pragmatic:

- It assumes the current architecture stays split between the Next.js frontend and the standalone Express backend under `backend/`.
- It focuses on the capabilities enterprise customers and security reviews usually require beyond the current production-ready baseline.
- It prioritizes work in dependency order, so earlier items unblock later controls.

## 1. Enterprise Exit Criteria

The platform should not be called enterprise-ready until all of the following are true:

1. Sensitive business flows are backend-owned, and the web client no longer depends on direct Firestore access for privileged reads or writes.
2. Identity supports enterprise controls such as SSO and org-managed lifecycle handling.
3. Authorization is auditable, tenant-aware where needed, and not limited to broad role flags.
4. All privileged mutations are covered by immutable audit events.
5. Production has structured logs, metrics, alerting, tracing, and documented incident response.
6. Delivery supports environment promotion, smoke checks, rollback, secrets management, and security scanning.
7. Data retention, backup/restore, and compliance evidence are documented and testable.

## 2. Current Gaps

The current repo is strong enough for a normal production release, but it still has these enterprise gaps:

- Remaining direct Firestore usage in the frontend and shared client services.
- Firebase email/password login only; no enterprise IdP or provisioning support.
- Partial audit coverage focused on auth/video flows rather than every privileged admin action.
- Basic observability built around `morgan`, `console`, and health checks.
- CI is present, but release automation, smoke checks, rollback, and security scanning are still missing.
- Secrets, retention, backup, recovery, and operational runbooks are documented only lightly or not at all.

## 3. Workstreams

### WS1. Backend Ownership Of Sensitive Data

Goal: eliminate direct client access to privileged Firestore data and make backend APIs the only policy boundary for sensitive operations.

Current evidence:

- `src/context/AuthContext.tsx`
- `src/infrastructure/services/authService.ts`
- `src/network/firebase/users.ts`
- `src/network/firebase/appointments.ts`
- multiple `src/infrastructure/services/*` modules still import `firebase/firestore`

Backlog:

| ID | Item | Priority | Effort | Dependencies |
|----|------|----------|--------|--------------|
| WS1-1 | Inventory all frontend `firebase/firestore` imports and classify them as keep/remove/migrate | P0 | 1-2 days | None |
| WS1-2 | Move user profile reads, role resolution, and auth-adjacent metadata reads behind backend APIs | P0 | 3-5 days | WS1-1 |
| WS1-3 | Replace direct user/admin Firestore helpers with backend-backed clients only | P0 | 3-5 days | WS1-2 |
| WS1-4 | Replace remaining appointment, notification, clinic booking, and profile writes that still use client Firestore | P0 | 1-2 weeks | WS1-2 |
| WS1-5 | Decide whether any realtime subscriptions remain allowed from the client; if yes, document the bounded cases and rules | P1 | 2-3 days | WS1-4 |
| WS1-6 | Add a CI guard that fails if new forbidden `firebase/firestore` imports appear in approved frontend layers | P1 | 1 day | WS1-4 |

Definition of done:

- Privileged data access is backend-only.
- The frontend no longer performs direct Firestore reads/writes for users, roles, appointments, prescriptions, bookings, or admin operations.
- CI fails on regressions.

### WS2. Enterprise Identity And Lifecycle

Goal: support enterprise customer identity requirements instead of consumer-only login.

Backlog:

| ID | Item | Priority | Effort | Dependencies |
|----|------|----------|--------|--------------|
| WS2-1 | Define supported enterprise identity model: OIDC first, SAML optional, org-to-IdP mapping | P0 | 2-4 days | None |
| WS2-2 | Add backend support for enterprise SSO session establishment and callback handling | P0 | 1-2 weeks | WS2-1 |
| WS2-3 | Add org-managed login routing and UI for IdP-based sign-in | P1 | 3-5 days | WS2-2 |
| WS2-4 | Add SCIM or equivalent provisioning/deprovisioning strategy for managed users | P1 | 1-2 weeks | WS2-1 |
| WS2-5 | Add session management controls: device/session listing, forced logout, session revocation, admin session invalidation | P1 | 4-6 days | WS2-2 |
| WS2-6 | Document supported auth flows, IdP setup, and break-glass admin procedures | P1 | 2-3 days | WS2-2 |

Definition of done:

- An enterprise customer can sign in through an approved IdP.
- User lifecycle changes can be administered centrally.
- Session revocation and emergency access procedures are documented and testable.

### WS3. Authorization, Org Boundaries, And Delegated Admin

Goal: move from coarse role checks to enterprise-grade permission control.

Backlog:

| ID | Item | Priority | Effort | Dependencies |
|----|------|----------|--------|--------------|
| WS3-1 | Define authorization model: global roles, org-scoped roles, resource ownership, delegated admin | P0 | 3-5 days | WS2-1 |
| WS3-2 | Introduce explicit permission checks in backend application/services layer instead of ad hoc route checks | P0 | 1-2 weeks | WS3-1 |
| WS3-3 | Add tenant/org identifiers where enterprise accounts require data separation | P0 | 1-2 weeks | WS3-1 |
| WS3-4 | Add support for delegated admin flows such as clinic manager vs. org admin vs. support admin | P1 | 1 week | WS3-2 |
| WS3-5 | Add authorization test matrix covering cross-tenant and cross-role access attempts | P1 | 3-5 days | WS3-2 |

Definition of done:

- Permission decisions are explicit and consistent.
- Cross-org data access is denied by design.
- Admin capabilities are narrower than a single universal `admin` role.

### WS4. Audit Logging And Compliance Evidence

Goal: produce reliable evidence for who changed what, when, and why.

Current evidence:

- Auth/session audit logging exists in `backend/src/routes/auth.ts`
- Security audit events exist in `backend/src/services/securityAuditService.ts`
- Admin mutation routes in `backend/src/routes/users.ts` do not yet emit matching audit events

Backlog:

| ID | Item | Priority | Effort | Dependencies |
|----|------|----------|--------|--------------|
| WS4-1 | Define audit event schema for auth, user admin, approvals, permissions, prescriptions, payouts, and billing | P0 | 2-3 days | None |
| WS4-2 | Add audit logging to all privileged admin mutations and sensitive business state transitions | P0 | 1 week | WS4-1 |
| WS4-3 | Make audit records append-only and protect them from ordinary admin mutation paths | P0 | 3-4 days | WS4-2 |
| WS4-4 | Add search/export filters for audit review with access controls and retention policy | P1 | 4-6 days | WS4-2 |
| WS4-5 | Add tamper-detection strategy or off-platform sink for high-value audit events | P1 | 3-5 days | WS4-2 |

Definition of done:

- Every privileged mutation generates a structured audit event.
- Audit events are queryable, immutable in practice, and retained according to policy.

### WS5. Observability, SRE, And Incident Response

Goal: move from logs-only operations to measurable service reliability.

Current evidence:

- Backend uses `morgan`, `console`, and `/health`
- Client log sinks exist, but backend metrics/traces are not implemented

Backlog:

| ID | Item | Priority | Effort | Dependencies |
|----|------|----------|--------|--------------|
| WS5-1 | Introduce structured backend logging with request IDs and consistent event fields | P0 | 3-5 days | None |
| WS5-2 | Add backend error reporting and alerts for API failures, auth failures, and webhook failures | P0 | 3-5 days | WS5-1 |
| WS5-3 | Add service metrics: request volume, latency, error rate, auth failures, webhook lag, queue depth where relevant | P0 | 1 week | WS5-1 |
| WS5-4 | Add tracing for cross-service request paths where the frontend calls the backend and the backend calls third parties | P1 | 1 week | WS5-1 |
| WS5-5 | Define SLOs, dashboards, paging thresholds, and incident runbooks | P1 | 3-5 days | WS5-2, WS5-3 |
| WS5-6 | Add synthetic smoke monitoring for login, booking, and admin health paths | P1 | 3-4 days | WS5-5 |

Definition of done:

- Production issues are visible within minutes.
- Teams can answer "is it broken, where, and since when?" from dashboards and alerts.
- Runbooks exist for the main failure classes.

### WS6. Delivery, Platform, And Secrets

Goal: move from code CI to enterprise-grade release control.

Current evidence:

- CI exists in `.github/workflows/ci.yml`
- No release workflow, smoke checks, rollback automation, IaC, or security scanning workflows were found

Backlog:

| ID | Item | Priority | Effort | Dependencies |
|----|------|----------|--------|--------------|
| WS6-1 | Decide deployment target model and codify infrastructure (Terraform/Helm/managed platform config) | P0 | 1-2 weeks | None |
| WS6-2 | Add environment promotion workflow: build once, deploy to staging, run smoke tests, then promote to prod | P0 | 1 week | WS6-1 |
| WS6-3 | Add rollback automation and release health checks | P0 | 3-5 days | WS6-2 |
| WS6-4 | Move secrets to managed secret storage and define rotation procedures | P0 | 3-5 days | WS6-1 |
| WS6-5 | Add dependency scanning, SAST, and container/image scanning in CI | P1 | 3-5 days | WS6-2 |
| WS6-6 | Add change-management controls for production deploy approval where required | P1 | 2-3 days | WS6-2 |

Definition of done:

- Deployments are repeatable and environment-controlled.
- Releases have post-deploy verification and rollback.
- Secrets are not managed manually through ad hoc `.env` file handling.

### WS7. Data Governance, Backups, And Recovery

Goal: satisfy enterprise expectations for retention, recoverability, and data handling.

Backlog:

| ID | Item | Priority | Effort | Dependencies |
|----|------|----------|--------|--------------|
| WS7-1 | Define data classification and retention policy by domain object | P0 | 3-4 days | None |
| WS7-2 | Document and test Firestore/Auth backup and restore procedures, including RPO/RTO targets | P0 | 1 week | WS7-1 |
| WS7-3 | Add disaster recovery runbook and restoration drills cadence | P1 | 2-3 days | WS7-2 |
| WS7-4 | Define data export/deletion procedures for customer and regulatory requests | P1 | 3-4 days | WS7-1 |
| WS7-5 | Document third-party data flows and processor boundaries (Firebase, Paddle, email/log sinks) | P1 | 2-3 days | WS7-1 |

Definition of done:

- Recovery objectives are documented and tested.
- Data lifecycle and deletion/export behavior are clear and repeatable.

### WS8. Security Program And Review Readiness

Goal: pass enterprise security questionnaires and shorten review cycles.

Backlog:

| ID | Item | Priority | Effort | Dependencies |
|----|------|----------|--------|--------------|
| WS8-1 | Produce architecture, data-flow, and threat-model documentation for auth, payments, and health data paths | P0 | 1 week | WS1-4, WS2-2 |
| WS8-2 | Add secure SDLC controls: dependency review, vulnerability triage cadence, patch ownership | P0 | 2-3 days | WS6-5 |
| WS8-3 | Run external penetration test and track remediation backlog | P1 | 1-2 weeks external | WS1-4, WS5-2, WS6-3 |
| WS8-4 | Prepare customer-facing security package: controls summary, logging, backup, incident response, vendor list | P1 | 3-5 days | WS4-4, WS5-5, WS7-5 |
| WS8-5 | If required by customer segment, prepare HIPAA/GDPR/ISO/SOC2 readiness plan with policy owners | P1 | 1-2 weeks | WS7-1, WS8-1 |

Definition of done:

- The team can answer standard enterprise security questionnaires with evidence.
- External review findings have a managed remediation path.

## 4. Recommended Phase Order

This is the fastest sequence that reduces enterprise risk without creating rework:

### Phase A. Control The Trust Boundary

Includes:

- WS1-1 through WS1-6
- WS4-1

Expected duration:

- 2-4 weeks

Why first:

- Enterprise controls are weak if the browser is still a privileged data client.

### Phase B. Identity And Authorization

Includes:

- WS2-1 through WS2-6
- WS3-1 through WS3-5

Expected duration:

- 3-6 weeks

Why second:

- SSO without org-aware authorization creates the wrong admin and tenant model.

### Phase C. Auditability And Operations

Includes:

- WS4-2 through WS4-5
- WS5-1 through WS5-6

Expected duration:

- 2-4 weeks

Why third:

- Once identity and policy are stable, you can instrument them properly and retain evidence.

### Phase D. Delivery And Recovery

Includes:

- WS6-1 through WS6-6
- WS7-1 through WS7-5

Expected duration:

- 2-4 weeks

Why fourth:

- Enterprise customers expect controlled releases, rollback, and recovery, not just healthy code.

### Phase E. Review Package

Includes:

- WS8-1 through WS8-5

Expected duration:

- 1-3 weeks, partly parallel

Why last:

- Security review artifacts should describe the controls you actually implemented, not aspirational ones.

## 5. Suggested Owners

| Area | Primary Owner | Secondary Owner |
|------|---------------|-----------------|
| Backend ownership / API migrations | Backend engineer | Frontend engineer |
| Enterprise identity | Backend engineer | Platform/security owner |
| Authorization model | Backend engineer | Product/ops owner |
| Audit/compliance events | Backend engineer | Security/compliance owner |
| Observability | Platform/SRE owner | Backend engineer |
| Delivery/infrastructure | Platform/SRE owner | Backend engineer |
| Recovery/data governance | Platform/security owner | Engineering lead |
| Security package / questionnaires | Security/compliance owner | Engineering lead |

## 6. Minimum Enterprise Milestone

If the goal is not "full enterprise maturity" but "pass first enterprise customer review", the minimum realistic milestone is:

1. Finish WS1.
2. Ship WS2-1 through WS2-3.
3. Ship WS3-1 through WS3-3.
4. Ship WS4-1 through WS4-3.
5. Ship WS5-1 through WS5-3.
6. Ship WS6-2 through WS6-5.
7. Ship WS7-1 through WS7-2.
8. Prepare WS8-1, WS8-4, and a remediation posture for WS8-3/WS8-5.

That should be treated as the earliest credible "enterprise pilot" bar, not the final state.

## 7. Near-Term Next Actions

Start with these five tasks in the next sprint:

1. Create a hard inventory of all remaining `firebase/firestore` usage in `src/` and mark each call path as migrate/remove/allowed realtime.
2. Add audit logging to admin user create/update/delete/reset-password flows.
3. Pick and document the enterprise identity target: OIDC only vs. OIDC + SAML.
4. Add structured backend logging and choose the production telemetry sink.
5. Decide the deployment/IaC target and secret manager so release automation can be designed once, not twice.
