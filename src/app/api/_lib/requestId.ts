export function createRequestId(): string {
  try {
    if (typeof globalThis !== "undefined" && "crypto" in globalThis) {
      const c = globalThis.crypto;
      if (typeof c?.randomUUID === "function") return c.randomUUID();
    }
  } catch {
    // ignore
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getRequestIdFromHeaders(headers: Headers): string | null {
  const value = headers.get("x-request-id") || headers.get("x-amzn-trace-id") || "";
  const id = value.trim();
  return id ? id : null;
}

export function getOrCreateRequestId(req: Request): string {
  return getRequestIdFromHeaders(req.headers) ?? createRequestId();
}

