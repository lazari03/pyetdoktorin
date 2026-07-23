import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

function parseNumberEnv(name: string, fallback?: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required environment variable ${name}`);
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid number for environment variable ${name}`);
  }
  return parsed;
}

function parseCsvEnv(name: string, fallback: string[] = []): string[] {
  const raw = process.env[name];
  if (!raw) return fallback;
  return raw.split(',').map((value) => value.trim()).filter((value) => value.length > 0);
}

export const env = {
  port: parseInt(process.env.PORT || '4000', 10),
  firebaseServiceAccount: requireEnv('FIREBASE_SERVICE_ACCOUNT'),
  paddleEnv: process.env.PADDLE_ENV ?? 'sandbox',
  paddleApiKey: process.env.PADDLE_API_KEY ?? '',
  paddleWebhookSecret: process.env.PADDLE_WEBHOOK_SECRET ?? '',
  paywallAmountUsd: parseNumberEnv('PAYWALL_AMOUNT_USD', parseNumberEnv('NEXT_PUBLIC_PAYWALL_AMOUNT_USD', 13)),
  appointmentPriceEur: parseNumberEnv('APPOINTMENT_PRICE_EUR', parseNumberEnv('NEXT_PUBLIC_APPOINTMENT_PRICE_EUR', 13)),
  appointmentPriceCurrency: process.env.APPOINTMENT_PRICE_CURRENCY ?? process.env.NEXT_PUBLIC_APPOINTMENT_PRICE_CURRENCY ?? 'EUR',
  // % of each paid appointment fee that goes to the doctor; the remainder is the platform's commission.
  doctorPayoutPercentage: parseNumberEnv('DOCTOR_PAYOUT_PERCENTAGE', parseNumberEnv('NEXT_PUBLIC_DOCTOR_PAYOUT_PERCENTAGE', 70)),
  corsOrigins: parseCsvEnv('CORS_ORIGINS', []),
  frontendUrl: process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_BASE_URL || '',
  notificationsCleanupSecret: process.env.NOTIFICATIONS_CLEANUP_SECRET ?? '',
};
