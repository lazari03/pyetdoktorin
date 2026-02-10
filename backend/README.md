# Pyet Doktorin Backend

Node.js + Express service that centralizes authentication, user management, appointments, prescriptions, clinics, and payments. Uses Firebase Admin SDK for data access and Paddle Billing for payment processing.

## Setup

### Environment Variables

Create `backend/.env` (or export these vars) with at least:

```
PORT=4000
FIREBASE_SERVICE_ACCOUNT={"projectId":"<firebase-project>","clientEmail":"service-account@project.iam.gserviceaccount.com","privateKey":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"}
PADDLE_ENV=sandbox
PADDLE_API_KEY=<paddle-api-key>
PADDLE_WEBHOOK_SECRET=<paddle-webhook-secret>
PADDLE_WEBHOOK_URL=<paddle-webhook-url>
NEXT_PUBLIC_PADDLE_ENV=sandbox
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=<paddle-client-token>
NEXT_PUBLIC_PADDLE_PRICE_ID=<paddle-price-id>
NEXT_PUBLIC_PAYWALL_AMOUNT_USD=13
```

- `FIREBASE_SERVICE_ACCOUNT`: JSON for a service account with Auth + Firestore admin permissions.
- Paddle Billing uses a webhook secret for signature verification. Keep `PADDLE_ENV` in sync with your Paddle dashboard.
- Ensure the frontend `.env` sets `NEXT_PUBLIC_BACKEND_URL=http://localhost:4000` (or your deployed URL) so `backendFetch` hits this service.

### Install & Run

1. Install dependencies:

```bash
cd backend
npm install
```

2. Run in development mode:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
npm start
```

When deployed separately, proxy `/api/*` from the frontend to this server or expose it publicly with proper HTTPS.

## API Routes

- `POST /api/auth/session` – Establish session cookies after Firebase login (expects `idToken`).
- `POST /api/auth/logout` – Clears session cookies.
- `GET/POST/PATCH/DELETE /api/users` – Admin user management.
- `GET/POST/PATCH /api/appointments` – Appointment workflows.
- `GET /api/notifications/role` – Resolve the current user role.
- `POST /api/notifications/appointment-details` – Batch fetch appointment metadata.
- `POST /api/notifications/dismiss/:id` – Mark a notification as dismissed.
- `GET/POST/PATCH /api/prescriptions` – Prescription issuance and updates.
- `GET /api/clinics/catalog` – List private clinics.
- `GET/POST/PATCH /api/clinics/bookings` – Clinic bookings per patient/clinic/admin.
- `POST /api/paddle/webhook` – Paddle webhook receiver (Billing).

All routes require `Authorization: Bearer <Firebase ID token>` header (except health check) and enforce role-based access.
