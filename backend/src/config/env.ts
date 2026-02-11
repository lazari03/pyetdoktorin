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
  corsOrigins: parseCsvEnv('CORS_ORIGINS', []),
  frontendUrl: process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_BASE_URL || '',
};
