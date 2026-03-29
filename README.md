# Pyet Doktorin

Pyet Doktorin is a Next.js telemedicine frontend backed by a standalone Express API in [`backend/`](./backend).

Current status:

- Production-ready on the current stack for a controlled deployment.
- Not enterprise-ready yet.
- Browser-executed privileged flows no longer use direct `firebase/firestore` access.

## Stack

- Frontend: Next.js 15, React 18, Zustand, Tailwind
- Backend: Express 5, TypeScript, Firebase Admin SDK
- Auth: Firebase Authentication
- Data: Firestore, accessed from the backend or server-only modules
- Billing: Paddle

## Architecture

- The browser talks to the backend for user/admin management, appointments, notifications, clinic bookings, prescriptions, stats, and admin blog CRUD.
- The backend enforces auth, role checks, audit logging, and structured request logging.
- Server-only Next.js modules may still use Firebase Admin for public or internal server work. Browser code should not import `firebase/firestore`.
- The import guard is enforced with `npm run guard:no-browser-firestore` and in CI.

## Local Development

1. Install dependencies:

```bash
npm ci
npm --prefix backend ci
```

2. Configure environment variables:

- Root frontend/server env:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
  - `NEXT_PUBLIC_BACKEND_URL=http://localhost:4000`
  - `NEXT_PUBLIC_SITE_URL=http://localhost:3000` recommended
  - `SESSION_SECRET` for 100ms session validation routes
  - Firebase Admin credentials for Next.js server-only routes:
    - `FIREBASE_SERVICE_ACCOUNT`, or
    - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

- Backend env:
  - Copy [`backend/.env.example`](./backend/.env.example)
  - At minimum set `FIREBASE_SERVICE_ACCOUNT`, `FRONTEND_URL`, and `CORS_ORIGINS`

3. Start the backend:

```bash
npm --prefix backend run dev
```

4. Start the frontend:

```bash
npm run dev
```

Default local URLs:

- Frontend: `http://127.0.0.1:3000`
- Backend: `http://127.0.0.1:4000`

## Verification

Static verification:

```bash
npm run guard:no-browser-firestore
npm run lint
npm test
npm run build
npm --prefix backend run typecheck
npm --prefix backend test
npm --prefix backend run build
```

One-shot wrapper:

```bash
npm run verify:current-stack
```

Runtime smoke checks, after both services are running:

```bash
npm run smoke:current
```

Helpful supporting checks:

```bash
npm run env:check
```

## Deployment Model

- Deploy the Next.js app and the Express backend as separate services.
- Set `NEXT_PUBLIC_BACKEND_URL` in the frontend to the backend origin.
- The backend is designed for the current simple hosting model: one app instance or otherwise centrally protected traffic.
- Backend logs are JSON on stdout/stderr and include `requestId`.

## Operational Limits

- Rate limiting is bounded and safer than before, but still process-local. Multi-instance deployments should add centralized throttling at the edge, load balancer, or Redis layer.
- Firebase Auth remains the identity system of record.
- This repo does not yet include enterprise SSO, SCIM, tenant-aware authorization, or enterprise-grade rollout automation.

## Optional Integrations

- Paddle: `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, `NEXT_PUBLIC_PADDLE_PRICE_ID`, `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`
- Contact email: `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS` or `SMTP_SERVICE`
- Client error sinks: `BETTERSTACK_SOURCE_TOKEN` or `DATADOG_API_KEY`

## Docs

- Backend runtime and routes: [`backend/README.md`](./backend/README.md)
- Backend deployment guide: [`docs/backend-deployment.md`](./docs/backend-deployment.md)
- Current production-readiness status: [`docs/production-readiness-plan.md`](./docs/production-readiness-plan.md)
- Future enterprise backlog: [`docs/enterprise-readiness-backlog.md`](./docs/enterprise-readiness-backlog.md)
