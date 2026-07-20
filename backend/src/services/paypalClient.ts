import { env } from '@/config/env';

export type PayPalErrorDetail = { issue?: string; description?: string };
export type PayPalErrorBody = {
  name?: string;
  message?: string;
  debug_id?: string;
  details?: PayPalErrorDetail[];
};

/**
 * PayPal's error responses carry a structured `{name, details:[{issue,...}]}`
 * body — callers need that structure (not just a stringified blob) to tell a
 * decline (COMPLIANCE_VIOLATION, INSTRUMENT_DECLINED, ...) apart from a
 * transient/technical failure.
 */
export class PayPalApiError extends Error {
  readonly status: number;
  readonly body: PayPalErrorBody | null;

  constructor(status: number, body: PayPalErrorBody | null, rawText: string) {
    super(body?.message || rawText || `PayPal API error (${status})`);
    this.name = 'PayPalApiError';
    this.status = status;
    this.body = body;
  }

  /** The first `details[].issue` code, e.g. "COMPLIANCE_VIOLATION" or "INSTRUMENT_DECLINED". */
  get issue(): string | undefined {
    return this.body?.details?.[0]?.issue;
  }
}

function getBaseUrl(): string {
  return (env.paypalEnv || 'sandbox').toLowerCase() === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.accessToken;
  }
  const basicAuth = Buffer.from(`${env.paypalClientId}:${env.paypalClientSecret}`).toString('base64');
  const response = await fetch(`${getBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `PayPal OAuth error (${response.status})`);
  }
  const payload = (await response.json()) as { access_token: string; expires_in: number };
  // Refresh a little early to avoid using a token that expires mid-request.
  cachedToken = {
    accessToken: payload.access_token,
    expiresAt: Date.now() + (payload.expires_in - 60) * 1000,
  };
  return cachedToken.accessToken;
}

export async function paypalFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  const text = await response.text();
  if (!response.ok) {
    let parsed: PayPalErrorBody | null = null;
    try {
      parsed = text ? (JSON.parse(text) as PayPalErrorBody) : null;
    } catch {
      parsed = null;
    }
    throw new PayPalApiError(response.status, parsed, text);
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}
