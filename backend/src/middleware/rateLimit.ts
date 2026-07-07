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

// Number of *trusted* reverse proxies in front of this service.
// `X-Forwarded-For` is client-controllable, so trusting an arbitrary entry lets an
// attacker rotate fake IPs and bypass rate limiting (credential stuffing / abuse).
// We only trust the last `TRUSTED_PROXY_HOPS` hops of the forwarding chain and fall
// back to the real TCP peer address. Default 0 = ignore the header entirely and key
// on the socket peer, which is the safe default for a directly exposed service.
// Set TRUSTED_PROXY_HOPS=1 (or the real hop count) when deployed behind a load balancer.
const TRUSTED_PROXY_HOPS = Math.max(0, Math.trunc(Number(process.env.TRUSTED_PROXY_HOPS ?? 0)) || 0);

function getClientIp(req: Request): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  const forwardedList = (Array.isArray(forwardedFor) ? forwardedFor : [forwardedFor])
    .filter((value): value is string => typeof value === 'string')
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  // Mirror Express `trust proxy = n` semantics: the resolved client is the
  // (n+1)-th address counted from the right of `[...xff, socketPeer]`.
  const chain = [...forwardedList, req.socket.remoteAddress].filter(
    (value): value is string => typeof value === 'string' && value.length > 0,
  );
  if (chain.length === 0) return 'unknown';
  const index = Math.max(0, chain.length - 1 - TRUSTED_PROXY_HOPS);
  return chain[index] ?? 'unknown';
}

function getClientKey(req: Request, prefix: string) {
  return `${prefix}:${getClientIp(req).trim()}`;
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
