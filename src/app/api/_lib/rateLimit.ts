type Bucket = {
  count: number;
  resetAt: number;
  touchedAt: number;
};

type RateLimitStore = {
  buckets: Map<string, Bucket>;
  lastPrunedAt: number;
};

const DEFAULT_MAX_BUCKETS = Number(process.env.API_RATE_LIMIT_MAX_BUCKETS ?? 5000) || 5000;
const PRUNE_INTERVAL_MS = 30_000;

function getStore(): RateLimitStore {
  const g = globalThis as unknown as { __pyetdoktorinRateLimit?: RateLimitStore };
  if (!g.__pyetdoktorinRateLimit) {
    g.__pyetdoktorinRateLimit = {
      buckets: new Map<string, Bucket>(),
      lastPrunedAt: 0,
    };
  }
  return g.__pyetdoktorinRateLimit;
}

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

function pruneStore(store: RateLimitStore, now: number, maxBuckets: number) {
  if (
    store.buckets.size < maxBuckets &&
    now - store.lastPrunedAt < PRUNE_INTERVAL_MS
  ) {
    return;
  }

  for (const [key, bucket] of store.buckets.entries()) {
    if (bucket.resetAt <= now) {
      store.buckets.delete(key);
    }
  }

  if (store.buckets.size >= maxBuckets) {
    const overflow = store.buckets.size - maxBuckets + 1;
    const evictionKeys = [...store.buckets.entries()]
      .sort(([, left], [, right]) => {
        if (left.resetAt !== right.resetAt) {
          return left.resetAt - right.resetAt;
        }
        return left.touchedAt - right.touchedAt;
      })
      .slice(0, overflow)
      .map(([key]) => key);

    for (const key of evictionKeys) {
      store.buckets.delete(key);
    }
  }

  store.lastPrunedAt = now;
}

export function applyRateLimitHeaders(headers: Headers, result: RateLimitResult) {
  headers.set("x-ratelimit-limit", String(result.limit));
  headers.set("x-ratelimit-remaining", String(result.remaining));
  headers.set("x-ratelimit-reset", String(result.resetAt));
  headers.set("retry-after", String(result.retryAfterSeconds));
}

export function rateLimit(params: { key: string; windowMs: number; max: number; now?: number; maxBuckets?: number }): RateLimitResult {
  const store = getStore();
  const now = params.now ?? Date.now();
  const maxBuckets = Math.max(100, params.maxBuckets ?? DEFAULT_MAX_BUCKETS);
  pruneStore(store, now, maxBuckets);
  const existing = store.buckets.get(params.key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + params.windowMs;
    store.buckets.set(params.key, { count: 1, resetAt, touchedAt: now });
    return {
      allowed: true,
      limit: params.max,
      remaining: Math.max(0, params.max - 1),
      resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil(params.windowMs / 1000)),
    };
  }

  existing.touchedAt = now;
  if (existing.count >= params.max) {
    return {
      allowed: false,
      limit: params.max,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    limit: params.max,
    remaining: Math.max(0, params.max - existing.count),
    resetAt: existing.resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = (forwardedFor?.split(",")[0] || req.headers.get("x-real-ip") || "unknown").trim();
  return ip || "unknown";
}
