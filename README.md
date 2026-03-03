# Architecture Overview

This project follows a modular, scalable architecture inspired by Domain-Driven Design (DDD) and Clean Architecture principles. The main layers and their responsibilities are:

### 1. App Layer (`src/app/`)
- Contains Next.js route handlers, pages, and layout components.
- Entry point for all UI routes and server-side logic.
- Composes the UI using presentation and domain logic.

### 2. Presentation Layer (`src/presentation/`)
- Houses all reusable UI components (e.g., tables, navbars, loaders).
- Components are organized by feature or type for clarity.
- Handles UI state, rendering, and user interaction.

### 3. Domain Layer (`src/domain/`)
- Contains business logic, core entities, and domain services.
- Entities (e.g., `User`, `Appointment`) are defined in `entities/`.
- Services encapsulate business rules and workflows.
- Repositories define interfaces for data access.

### 4. Application Layer (`src/application/`)
- Implements use cases (application-specific business logic).
- Orchestrates domain services, repositories, and external APIs.
- Use cases are invoked from UI or API routes.

### 5. Infrastructure Layer (`src/infrastructure/`)
- Implements data access, API clients, and integration with external services (e.g., Firebase, Paddle).
- Provides concrete implementations for domain repositories.

### 6. Store Layer (`src/store/`)
- Manages global and feature-specific state using Zustand.
- Stores are injected into components and use cases as needed.

### 7. Config, Context, and Utilities
- `src/config/`: Centralized configuration (API keys, constants, etc.).
- `src/context/`: React context providers for dependency injection and authentication.
- `src/utils/`: Utility functions and helpers.

### 8. i18n and Localization
- `src/i18n/` and `src/locales/`: Internationalization setup and translation files.

---

## Adapted Project Structure

```
src/
├── app/                # Next.js app directory (routes, pages, layouts)
├── application/        # Use cases (business/application logic)
├── components/         # (Legacy or shared components, if any)
├── config/             # Configuration files and constants
├── context/            # React context providers (DI, Auth, etc.)
├── domain/             # Core business logic, entities, services, repositories
├── i18n/               # Internationalization setup
├── infrastructure/     # Data access, API clients, external integrations
├── locales/            # Translation files
├── models/             # TypeScript models and types
├── navigation/         # Navigation helpers and route utilities
├── network/            # API/networking utilities
├── presentation/       # UI components, organized by feature/type
├── store/              # Zustand stores for state management
├── styles/             # Global and component styles
├── utils/              # Utility functions
```

---

## How It Works

- **UI components** in `presentation/` are composed in `app/` pages and layouts.
- **Business logic** is encapsulated in `domain/` and orchestrated by use cases in `application/`.
- **State** is managed via Zustand stores in `store/`.
- **External services** (APIs, Firebase, Paddle) are accessed via `infrastructure/`.
- **Configuration** and **context** are injected where needed for flexibility and testability.
- **Internationalization** is supported via `i18n/` and `locales/`.

---
# Telemedicine Frontend

A Next.js frontend application.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager

## Development

To run the development server:

```bash
# Install dependencies
npm install
# or
yarn install

# Start development server
npm run dev
# or
yarn dev
```

The development server will start at [http://localhost:3000](http://localhost:3000).

## Troubleshooting

### Blank page / chunks failing to load / `Cannot find module './####.js'` (Next.js)

If you see errors like:
- `Error: Cannot find module './8548.js'` (from `.next/server/webpack-runtime.js`), or
- the browser fails to load `/_next/static/chunks/*` and the UI is blank,

your local build output is usually stale/corrupted (or you have cached old assets).

Fix:

```bash
# stop the dev server first (Ctrl+C)
npm run clean
npm run dev
```

Tip: prefer `npm run dev:clean` when you hit any `/_next/static/*` 404s or `Cannot find module './####.js'` errors.

If it happens in production after a deploy, do a hard refresh and ensure any service worker is disabled/cleared (this repo unregisters SWs by default unless `NEXT_PUBLIC_ENABLE_SERVICE_WORKER=true`).

## Building for Production

To create a production build:

```bash
# Create production build using production environment variables
npm run build:prod
# or
yarn build:prod
```

To test the production build locally:

```bash
# Start production server
npm run start:prod
# or
yarn start:prod
```

The production server will start at [http://localhost:3000](http://localhost:3000).

## Environment Variables

The project uses two environment files:
- `.env.development` - Used during development
- `.env.production` - Used for production builds

Make sure these files are properly configured before building or deploying.

### Paddle (Billing) Paywall (patients)
- `PADDLE_ENV` – `sandbox` or `live` (defaults to `sandbox`).
- `PADDLE_API_KEY` – Paddle API key (server-side, optional for future server calls).
- `PADDLE_WEBHOOK_SECRET` – Paddle webhook secret for signature verification.
- `PADDLE_WEBHOOK_URL` – Webhook endpoint URL.
- `NEXT_PUBLIC_PADDLE_ENV` – `sandbox` or `live` (client-side).
- `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` – Paddle client token for Paddle.js.
- `NEXT_PUBLIC_PADDLE_PRICE_ID` – Paddle Billing price ID for the one-time payment.
- `PAYWALL_AMOUNT_USD` – Display-only amount in USD (defaults to `13` if unset).
- `NEXT_PUBLIC_PAYWALL_AMOUNT_USD` – Same amount exposed to the client for display.

Paddle checkout redirects back to:
`/dashboard/appointments?paid=<appointmentId>`.

### Contact form email (website)
The website contact form posts to `POST /api/contact/send-email` (Next.js route handler).

Set one of the following configurations:
- **Recommended SMTP**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (optional: `SMTP_SECURE=true`).
- **Service-based (e.g. Gmail)**: `SMTP_SERVICE=gmail` + `SMTP_USER` + `SMTP_PASS` (or legacy `CONTACT_EMAIL_USER` + `CONTACT_EMAIL_PASS`).

Optional:
- `CONTACT_EMAIL_TO` (defaults to `info@pyetdoktorin.al`)
- `CONTACT_EMAIL_FROM` / `MAIL_FROM` (defaults to `CONTACT_EMAIL_TO`)

Security note: in production, set `SITE_URL` / `NEXT_PUBLIC_SITE_URL` so the route can validate the `Origin` header.

### Cookies
- `NEXT_PUBLIC_COOKIE_DOMAIN` / `COOKIE_DOMAIN` (optional): set to something like `.pyetdoktorin.al` if you use both `www` and apex domains and want cookies (language/consent) to persist across subdomains. Do **not** set this for `localhost`.
  - If unset, the app will try a conservative best-effort inference (works for `www` ↔ apex, but cannot persist across unrelated domains by browser design).

### Observability (client errors)
The app posts runtime client errors to `POST /api/client-error` (same-origin, rate-limited) and includes a `requestId` to help correlate logs.

By default it logs to stdout only. To persist errors in a log sink, set one of:
- **Better Stack (Logtail)**: `BETTERSTACK_SOURCE_TOKEN` (or `LOGTAIL_SOURCE_TOKEN`) and optionally `CLIENT_ERROR_SINKS=betterstack`
- **Datadog Logs**: `DATADOG_API_KEY` and optionally `DATADOG_SITE` (default `datadoghq.com`), `DATADOG_SERVICE`, `DATADOG_TAGS`, plus `CLIENT_ERROR_SINKS=datadog`

## Deployment

1. First, build the project using production environment:
   ```bash
   npm run build:prod
   # or
   yarn build:prod
   ```

2. The build output will be generated in the `.next` directory

3. Deploy the application:
   - For Vercel deployment:
     ```bash
     vercel --prod
     ```
   - For other hosting platforms, follow their respective deployment guides using the production build output

## Available Scripts

- `npm run dev` - Start development server
- `npm run clean` - Remove `.next` / `.turbo` caches (fixes stale chunk issues)
- `npm run env:check` - Validate important environment variables (recommended before deploy)
- `npm run build` - Create a production build
- `npm run build:prod` - Create a production build with production env variables
- `npm run start` - Start production server
- `npm run start:prod` - Start production server with production env variables
- `npm run lint` - Run linting checks

## Project Structure

```
root/
├── app/              # Next.js app directory
├── public/           # Static files
├── .env.development  # Development environment variables
├── .env.production   # Production environment variables
└── next.config.ts    # Next.js configuration
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
