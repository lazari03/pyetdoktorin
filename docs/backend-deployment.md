# Backend Deployment Guide

This guide documents the supported current-stack deployment model for the Express backend in `backend/`.

## Status

- Production-ready for the current single-service hosting model
- Uses structured JSON logs with request IDs
- Uses bounded in-memory rate limiting
- Requires extra work for multi-instance hardening

## Runtime Requirements

- Node.js 20+
- Firebase Admin credentials with Auth and Firestore access
- HTTPS in front of the backend for production
- Frontend configured with `NEXT_PUBLIC_BACKEND_URL` pointing to the backend origin

## Environment

Use [`backend/.env.example`](../backend/.env.example) for local/staging and [`backend/.env.example.production`](../backend/.env.example.production) for production-style values.

Required:

- `FIREBASE_SERVICE_ACCOUNT`
- `FRONTEND_URL`
- `CORS_ORIGINS`

Recommended:

- `PAYWALL_AMOUNT_USD`
- `PADDLE_ENV`
- `PADDLE_API_KEY`
- `PADDLE_WEBHOOK_SECRET`
- `AUTH_COOKIE_MAX_AGE_SECONDS`
- `RATE_LIMIT_MAX_BUCKETS`

## Build And Start

```bash
npm --prefix backend ci
npm --prefix backend run typecheck
npm --prefix backend test
npm --prefix backend run build
npm --prefix backend start
```

The compiled server starts from `backend/dist/index.js`.

## Local Or Staging Bring-Up

1. Fill `backend/.env`.
2. Start the backend with `npm --prefix backend run dev`.
3. Start the frontend with `npm run dev`.
4. Confirm the frontend points to the backend origin through `NEXT_PUBLIC_BACKEND_URL`.

## Smoke Checks

After both services are running:

```bash
npm run smoke:current
```

The smoke script checks:

- frontend home page reachability
- backend `/health`
- auth guard on `/api/users/me`
- auth guard on `/api/blog`

## Observability Expectations

- HTTP requests are logged as JSON with `requestId`
- application errors log the same `requestId`
- `/health` exposes a simple readiness signal
- security audit events are persisted in Firestore for sensitive flows

This is enough for the current stack, but not a full observability platform. Centralized log shipping, alerting, dashboards, and tracing are still future work.

## Rollback And Manual Recovery

There is no deployment automation or automated rollback in this repo yet.

Current manual rollback procedure:

1. redeploy the previous known-good frontend artifact
2. redeploy the previous known-good backend artifact or image
3. rerun:

```bash
npm run smoke:current
```

4. verify `/health`, login/session establishment, admin user management, appointment listing, clinic booking updates, and admin blog CRUD

## Hosting Notes

- A checked-in `backend/Dockerfile` exists if you prefer container deployment.
- A systemd-style service also works for VM deployments.
- For multi-instance deployments, move rate limiting to a centralized system or the edge before claiming the setup hardened.

## What This Guide Does Not Claim

- enterprise SSO/SAML/OIDC
- SCIM or tenant-aware authorization
- centralized secrets management
- rollout automation or automated rollback
- enterprise-grade metrics, tracing, or incident response

Those remain future scope beyond the current production-ready target.
