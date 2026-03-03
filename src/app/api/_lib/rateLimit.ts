type Bucket = { count: number; resetAt: number };

function getStore(): Map<string, Bucket> {
  const g = globalThis as unknown as { __pyetdoktorinRateLimit?: Map<string, Bucket> };
  if (!g.__pyetdoktorinRateLimit) {
    g.__pyetdoktorinRateLimit = new Map<string, Bucket>();
  }
  return g.__pyetdoktorinRateLimit;
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export function rateLimit(params: { key: string; windowMs: number; max: number; now?: number }): RateLimitResult {
  const store = getStore();
  const now = params.now ?? Date.now();
  const existing = store.get(params.key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + params.windowMs;
    store.set(params.key, { count: 1, resetAt });
    return { allowed: true, remaining: Math.max(0, params.max - 1), resetAt };
  }

  if (existing.count >= params.max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: Math.max(0, params.max - existing.count), resetAt: existing.resetAt };
}

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = (forwardedFor?.split(",")[0] || req.headers.get("x-real-ip") || "unknown").trim();
  return ip || "unknown";
}

