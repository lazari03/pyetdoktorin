let currentToken: string | null = null;
let listeners: Array<(token: string | null) => void> = [];

export function setAuthToken(token: string | null) {
  currentToken = token;
  listeners.forEach((fn) => fn(token));
}

export function getAuthToken(): string | null {
  return currentToken;
}

export function onTokenChange(callback: (token: string | null) => void): () => void {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((fn) => fn !== callback);
  };
}

export function waitForToken(timeoutMs = 3000, intervalMs = 120): Promise<string | null> {
  if (currentToken) return Promise.resolve(currentToken);
  return new Promise((resolve) => {
    const start = Date.now();
    const id = setInterval(() => {
      if (currentToken) {
        clearInterval(id);
        resolve(currentToken);
      } else if (Date.now() - start >= timeoutMs) {
        clearInterval(id);
        resolve(null);
      }
    }, intervalMs);
  });
}
