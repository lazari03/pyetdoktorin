
import { getAuth } from 'firebase/auth';

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

async function getIdToken(): Promise<string> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Not authenticated');
  }
  return user.getIdToken();
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

export async function backendFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${backendBaseUrl}${path}`;
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const hasAuthHeader = headers.has('Authorization');

  const baseOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  let response: Response;
  try {
    response = await fetchWithRetry(url, baseOptions);
    if (response.status === 401 && !hasAuthHeader) {
      const token = await getIdToken();
      const retryHeaders = new Headers(headers);
      retryHeaders.set('Authorization', `Bearer ${token}`);
      response = await fetchWithRetry(url, {
        ...baseOptions,
        headers: retryHeaders,
      });
    }
  } catch (err) {
    console.error('backendFetch network error:', err);
    if (err instanceof Error && err.message === 'Not authenticated') {
      throw err;
    }
    throw new Error('Network error: ' + (err instanceof Error ? err.message : String(err)));
  }
  if (!response.ok) {
    const text = await response.text();
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
