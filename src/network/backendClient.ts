
import { getAuth } from 'firebase/auth';

const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

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
  throw lastError ?? new Error('Fetch failed after retries');
}

export async function backendFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getIdToken();
  const url = `${backendBaseUrl}${path}`;
  let response: Response;
  try {
    response = await fetchWithRetry(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
  } catch (err) {
    // Log and rethrow for higher-level handling
    console.error('backendFetch network error:', err);
    throw new Error('Network error: ' + (err instanceof Error ? err.message : String(err)));
  }
  if (!response.ok) {
    const text = await response.text();
    console.error('backendFetch error response:', response.status, text);
    throw new Error(text || `Backend request failed with status ${response.status}`);
  }
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}
