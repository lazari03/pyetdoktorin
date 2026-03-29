import type { Request, Response, NextFunction } from 'express';

type RateLimitOptions = {
  windowMs: number;
  max: number;
  keyPrefix?: string;
  maxBuckets?: number;
};

type Bucket = {
  count: number;
  resetAt: number;
  touchedAt: number;
};

const buckets = new Map<string, Bucket>();
const DEFAULT_MAX_BUCKETS = Number(process.env.RATE_LIMIT_MAX_BUCKETS ?? 10000) || 10000;
const PRUNE_INTERVAL_MS = 30_000;
let lastPrunedAt = 0;

function getClientKey(req: Request, prefix: string) {
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(',')[0] || req.socket.remoteAddress || 'unknown';
  return `${prefix}:${String(ip).trim()}`;
}

function pruneBuckets(now: number, maxBuckets: number) {
  if (buckets.size < maxBuckets && now - lastPrunedAt < PRUNE_INTERVAL_MS) return;

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }

  if (buckets.size >= maxBuckets) {
    const overflow = buckets.size - maxBuckets + 1;
    const evictionKeys = [...buckets.entries()]
      .sort(([, left], [, right]) => {
        if (left.resetAt !== right.resetAt) {
          return left.resetAt - right.resetAt;
        }
        return left.touchedAt - right.touchedAt;
      })
      .slice(0, overflow)
      .map(([key]) => key);

    for (const key of evictionKeys) {
      buckets.delete(key);
    }
  }

  lastPrunedAt = now;
}

export const createRateLimiter = (options: RateLimitOptions) => {
  const prefix = options.keyPrefix ?? 'rate';
  const maxBuckets = Math.max(100, options.maxBuckets ?? DEFAULT_MAX_BUCKETS);
  return (req: Request, res: Response, next: NextFunction) => {
    const key = getClientKey(req, prefix);
    const now = Date.now();
    pruneBuckets(now, maxBuckets);
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      const resetAt = now + options.windowMs;
      buckets.set(key, { count: 1, resetAt, touchedAt: now });
      res.setHeader('X-RateLimit-Limit', String(options.max));
      res.setHeader('X-RateLimit-Remaining', String(Math.max(0, options.max - 1)));
      res.setHeader('X-RateLimit-Reset', String(resetAt));
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil(options.windowMs / 1000))));
      return next();
    }
    bucket.touchedAt = now;
    bucket.count += 1;
    res.setHeader('X-RateLimit-Limit', String(options.max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, options.max - bucket.count)));
    res.setHeader('X-RateLimit-Reset', String(bucket.resetAt));
    if (bucket.count > options.max) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))));
      return res.status(429).json({ error: 'RATE_LIMIT_EXCEEDED' });
    }
    return next();
  };
};
