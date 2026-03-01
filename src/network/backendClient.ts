
import { auth } from '@/config/firebaseconfig';

const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

type BackendErrorPayload = {
  error?: unknown;
  message?: unknown;
  detail?: unknown;
};

export class BackendError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly detail?: string;

  constructor(message: string, status: number, code?: string, detail?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.detail = detail;
    this.name = 'BackendError';
  }
}

const parseBackendError = (text: string): BackendErrorPayload | null => {
  try {
    return JSON.parse(text) as BackendErrorPayload;
  } catch {
    return null;
  }
};

async function waitForCurrentUser(timeoutMs = 3000, intervalMs = 120) {
  if (auth.currentUser) return auth.currentUser;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (auth.currentUser) return auth.currentUser;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return null;
}

async function getOptionalIdToken(timeoutMs = 3000): Promise<string | null> {
  const user = auth.currentUser ?? (await waitForCurrentUser(timeoutMs));
  if (!user) {
    return null;
  }
  try {
    return await user.getIdToken();
  } catch (error) {
    console.warn('Failed to get auth token', error);
    return null;
  }
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 500): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      lastError = err;
      // Log error details for diagnostics
      console.error(`Fetch attempt ${attempt + 1} failed:`, err);
      if (attempt < retries - 1) {
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }
  throw lastError;
}

function isProbablyHtmlResponse(res: Response, bodyText: string): boolean {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.toLowerCase().includes('text/html')) return true;
  return /^\s*<!doctype html/i.test(bodyText) || /^\s*<html[\s>]/i.test(bodyText);
}

export async function backendFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const useProxy = typeof window !== 'undefined';
  const url = useProxy ? `/api/backend${path}` : `${backendBaseUrl}${path}`;
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const method = (options.method || 'GET').toUpperCase();
  const isRead = method === 'GET' || method === 'HEAD';
  let hasAuthHeader = headers.has('Authorization');
  if (!hasAuthHeader) {
    const token = await getOptionalIdToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
      hasAuthHeader = true;
    }
  }

  const baseOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
    // Prevent stale cached responses for auth-protected dashboard reads.
    ...(isRead ? { cache: 'no-store' } : {}),
  };

  let response: Response;
  try {
    response = await fetchWithRetry(url, baseOptions);
    if (response.status === 401 && !hasAuthHeader) {
      // After a redirect/reload (e.g. returning from Paddle), Firebase Auth can take a moment to hydrate.
      // Give it longer on the 401 retry so payment sync doesn't fail spuriously.
      const token = await getOptionalIdToken(15000);
      if (token) {
        const retryHeaders = new Headers(headers);
        retryHeaders.set('Authorization', `Bearer ${token}`);
        response = await fetchWithRetry(url, {
          ...baseOptions,
          headers: retryHeaders,
        });
      }
    }
  } catch (err) {
    console.error('backendFetch network error:', err);
    throw new Error('Network error: ' + (err instanceof Error ? err.message : String(err)));
  }
  if (!response.ok) {
    const text = await response.text();

    // If the /api/backend proxy route isn't available (common in some deploy setups),
    // Next may return an HTML 404 page. Fall back to calling the backend directly.
    if (useProxy && response.status === 404 && isProbablyHtmlResponse(response, text)) {
      try {
        const directUrl = `${backendBaseUrl}${path}`;
        const directRes = await fetchWithRetry(directUrl, {
          ...baseOptions,
          // Direct calls don't need cookies; avoid CORS/credential edge cases.
          credentials: 'omit',
        });
        if (directRes.ok) {
          const directText = await directRes.text();
          return directText ? (JSON.parse(directText) as T) : ({} as T);
        }
        const directText = await directRes.text();
        console.error('backendFetch direct fallback error:', directRes.status, directText);
      } catch (fallbackError) {
        console.error('backendFetch direct fallback failed:', fallbackError);
      }
    }

    console.error('backendFetch error response:', response.status, text);
    const payload = parseBackendError(text);
    const code = typeof payload?.error === 'string' ? payload.error : undefined;
    const message =
      typeof payload?.message === 'string'
        ? payload.message
        : typeof payload?.error === 'string'
          ? payload.error
          : text || `Backend request failed with status ${response.status}`;
    const detail = typeof payload?.detail === 'string' ? payload.detail : undefined;
    throw new BackendError(message, response.status, code, detail);
  }
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}
