import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

function normalizeRequestId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 200);
}

export function attachRequestContext(req: Request, res: Response, next: NextFunction) {
  const headerValue = req.headers['x-request-id'];
  const forwardedRequestId = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  const requestId = normalizeRequestId(forwardedRequestId) ?? randomUUID();

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}
