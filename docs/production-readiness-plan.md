# Current-Stack Production Readiness

This repo now targets an honest, current-stack production bar:

- Next.js frontend in the repo root
- standalone Express backend in `backend/`
- Firebase Auth retained as the auth system of record
- current simple hosting model retained

It should be described as production-ready on the current stack, not enterprise-ready.

## Completed Hardening

- Browser-executed privileged flows use backend APIs instead of direct `firebase/firestore` access.
- Admin blog CRUD is backend-owned and audited.
- Clinic booking status changes are backend-owned and audited.
- Current-user profile reads and updates are backend-owned.
- Backend logs are structured JSON and include `requestId`.
- CI covers frontend lint/test/build, backend typecheck/test/build, security scans, and the browser Firestore import guard.
- The repo includes a smoke script for the supported runtime model.

## Verification Contract

Static validation:

```bash
npm run guard:no-browser-firestore
npm run lint
npm test
npm run build
npm --prefix backend run typecheck
npm --prefix backend test
npm --prefix backend run build
```

Convenience wrapper:

```bash
npm run verify:current-stack
```

Runtime smoke checks:

```bash
npm run smoke:current
```

## Operational Assumptions

- Current supported deployment is a controlled frontend + backend deployment on the existing architecture.
- Rate limiting is bounded but process-local. Multi-instance deployments need centralized throttling before they should be described as hardened.
- Firebase Admin credentials are still required in both the backend and the Next.js server-only code paths that use Firebase Admin.
- Audit logs are persisted for the hardened sensitive flows, but enterprise-wide governance controls are out of scope here.

## Explicit Non-Goals

This document does not claim:

- enterprise SSO/SAML/OIDC
- SCIM provisioning
- tenant-aware enterprise authorization
- infrastructure-as-code or automated environment promotion
- enterprise observability or compliance readiness

For that future scope, see [`docs/enterprise-readiness-backlog.md`](./enterprise-readiness-backlog.md).
