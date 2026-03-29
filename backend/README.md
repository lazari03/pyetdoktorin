# Pyet Doktorin Backend

Standalone Express API for auth, user/admin management, appointments, prescriptions, clinic bookings, notifications, stats, availability, and admin blog operations.

Current status:

- Production-ready on the current stack.
- Designed for the current simple hosting model.
- Not a full enterprise platform by itself.

## Commands

```bash
npm --prefix backend ci
npm --prefix backend run dev
npm --prefix backend run typecheck
npm --prefix backend test
npm --prefix backend run build
npm --prefix backend start
```

## Required Environment Variables

Use [`backend/.env.example`](./.env.example) as the source of truth.

- `PORT` default `4000`
- `FIREBASE_SERVICE_ACCOUNT` Firebase Admin service-account JSON
- `FRONTEND_URL` canonical frontend origin
- `CORS_ORIGINS` comma-separated allowed browser origins

Common optional variables:

- `PAYWALL_AMOUNT_USD` default `13`
- `PADDLE_ENV` default `sandbox`
- `PADDLE_API_KEY`
- `PADDLE_WEBHOOK_SECRET`
- `AUTH_COOKIE_MAX_AGE_SECONDS` default `1800`
- `RATE_LIMIT_MAX_BUCKETS` default `10000`

## Route Groups

- `GET /health`
- `POST /api/auth/session`
- `POST /api/auth/register-profile`
- `POST /api/auth/logout`
- `GET/PATCH /api/users/me`
- `GET/POST/PATCH/DELETE /api/users`
- `POST /api/users/:id/reset-password`
- `GET/POST/PATCH /api/appointments`
- `POST /api/appointments/:id/payment-started`
- `POST /api/appointments/:id/payment-cancelled`
- `GET/POST/PATCH /api/prescriptions`
- `GET/POST/PATCH /api/clinics/bookings`
- `GET /api/clinics/catalog`
- `GET /api/clinics/private`
- `GET /api/notifications/role`
- `POST /api/notifications/appointment-details`
- `POST /api/notifications/dismiss/:id`
- `GET /api/stats/admin`
- `GET /api/stats/admin/top-doctors`
- `GET /api/stats/admin/medicine-usage`
- `GET /api/doctors`
- `GET /api/availability/presets`
- `GET/PATCH /api/availability/me`
- `GET /api/availability/:doctorId/slots`
- `GET/POST/PATCH/DELETE /api/blog`
- `GET /api/security-logs`
- `POST /api/paddle/webhook`
- `POST /api/paddle/sync`

All authenticated routes expect `Authorization: Bearer <Firebase ID token>` unless the route establishes or clears session state itself.

## Logging And Auditing

- HTTP logs are emitted as JSON with `requestId`, method, path, status, duration, and response size.
- Request-scoped errors are logged with the same `requestId`.
- Sensitive admin and business mutations write audit events to Firestore.

## Deployment Assumptions

- Single backend instance or equivalent centrally throttled traffic.
- HTTPS in front of the service in production.
- Frontend and backend deployed separately, with the frontend pointing `NEXT_PUBLIC_BACKEND_URL` at this service.

If you scale to multiple backend instances, replace or augment the in-memory rate limiter with centralized rate limiting.

## Verification

```bash
npm --prefix backend run typecheck
npm --prefix backend test
npm --prefix backend run build
```

See [`../docs/backend-deployment.md`](../docs/backend-deployment.md) for the runtime and recovery guide.
