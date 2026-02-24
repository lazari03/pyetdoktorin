import type { Request, Response, NextFunction } from 'express';

type RateLimitOptions = {
  windowMs: number;
  max: number;
  keyPrefix?: string;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10000;

function getClientKey(req: Request, prefix: string) {
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(',')[0] || req.socket.remoteAddress || 'unknown';
  return `${prefix}:${String(ip).trim()}`;
}

function pruneBuckets(now: number) {
  if (buckets.size <= MAX_BUCKETS) return;
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export const createRateLimiter = (options: RateLimitOptions) => {
  const prefix = options.keyPrefix ?? 'rate';
  return (req: Request, res: Response, next: NextFunction) => {
    const key = getClientKey(req, prefix);
    const now = Date.now();
    pruneBuckets(now);
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }
    bucket.count += 1;
    if (bucket.count > options.max) {
      res.setHeader('Retry-After', Math.ceil((bucket.resetAt - now) / 1000));
      return res.status(429).json({ error: 'RATE_LIMIT_EXCEEDED' });
    }
    return next();
  };
};
