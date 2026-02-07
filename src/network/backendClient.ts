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

export async function backendFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getIdToken();
  const response = await fetch(`${backendBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Backend request failed');
  }
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}
