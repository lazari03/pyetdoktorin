## Alo Doktor Backend Deployment Guide

This walk-through covers standing up the Express backend locally, in staging, and in production. It assumes the frontend lives in the repo root (`/`), while the backend is under `/backend`.

### 1. Environment Variables

Backend expects the following at runtime (see `backend/.env.example`):

| Variable | Description |
|----------|-------------|
| `PORT` | Port the Express server listens on (default `4000`). |
| `FIREBASE_SERVICE_ACCOUNT` | JSON string for a Firebase service account with Auth + Firestore admin permissions. |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | PayPal REST credentials (sandbox or live). |
| `PAYPAL_API_BASE` | Either `https://api-m.sandbox.paypal.com` or `https://api-m.paypal.com`. |
| `NEXT_PUBLIC_PAYWALL_AMOUNT_USD` | Amount (USD) displayed to patients; also used server-side when computing revenue. |

Frontend `.env` must include:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000 # or HTTPS endpoint in production
```

### 2. Local Development

1. Install dependencies: `npm install` (root) and `npm --prefix backend install`.
2. Start backend: `npm --prefix backend run dev` (hot reload).
3. Start frontend: `npm run dev` (App Router).

- Ensure `NEXT_PUBLIC_BACKEND_URL` points to the backend dev server.
- The frontend fetch helper (`backendFetch`) automatically includes Firebase auth tokens, so log into the frontend before hitting backend-protected pages.

### 3. Production Build

1. Build backend: `npm --prefix backend run build` → outputs `backend/dist`.
2. Start backend: `npm --prefix backend start` (runs `node dist/index.js`).
3. Build frontend: `npm run build` followed by `npm start` (or deploy via Vercel).

Systemd sample service (drop into `/etc/systemd/system/alo-backend.service`):

```
[Unit]
Description=Alo Doktor Backend
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/alo
EnvironmentFile=/opt/alo/backend/.env
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Remember to run `npm install` + `npm run build` before enabling the service.

### 4. Deployment Targets

- **Render/Fly.io/Heroku**: Deploy `/backend` as a Node service. Use build command `npm install && npm run build` with start command `npm start`.
- **Vercel**: Not ideal for long-running Express servers; instead, deploy to Vercel Edge for the frontend and host backend separately.
- **Docker**: Create a multi-stage Dockerfile to compile TypeScript, e.g.

```
FROM node:20-slim AS build
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend .
RUN npm run build

FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY backend/package*.json ./
ENV NODE_ENV=production
CMD ["dist/index.js"]
```

### 5. Observability & Operations

- Logging: `morgan` is enabled by default; pipe stdout/stderr to your log collector (Datadog, Stackdriver, etc.).
- Error Handling: Non-2xx responses include JSON bodies; consider adding Sentry/Axiom integration for deeper telemetry.
- Monitoring: Track health via `/health` (returns JSON `{ status: 'ok', uptime }`).
- Scaling: Add a reverse proxy (NGINX, Traefik) or load balancer when running multiple backend instances. Sticky sessions are not required because authentication uses Firebase ID tokens per request.

### 6. Frontend Integration Checklist

1. Ensure `NEXT_PUBLIC_BACKEND_URL` is set for each environment (local, staging, prod).
2. Configure Firebase web client to point at the same project the backend service account uses.
3. Verify PayPal environment (sandbox vs. production) matches the backend config.
4. Run `npm run lint` (frontend) and `npm --prefix backend run build` before deploying to catch type issues.

### 7. Remaining TODOs

- Hook backend logs into centralized monitoring.
- Add CI/CD workflow (GitHub Actions) to build/test both frontend and backend.
- Automate secret management (e.g., Doppler, Vault) instead of committing `.env` files.
