import type { Request } from 'express';

type LogLevel = 'info' | 'warn' | 'error';

function toErrorPayload(error: unknown) {
  if (error instanceof Error) {
    return {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
    };
  }
  return {
    errorMessage: String(error),
  };
}

function serialize(level: LogLevel, event: string, details: Record<string, unknown>) {
  return JSON.stringify({
    level,
    event,
    timestamp: new Date().toISOString(),
    ...details,
  });
}

export function logEvent(level: LogLevel, event: string, details: Record<string, unknown> = {}) {
  const line = serialize(level, event, details);
  if (level === 'error') {
    console.error(line);
    return;
  }
  if (level === 'warn') {
    console.warn(line);
    return;
  }
  console.log(line);
}

export function logRequestError(event: string, req: Request, error: unknown, details: Record<string, unknown> = {}) {
  logEvent('error', event, {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl || req.path,
    ...details,
    ...toErrorPayload(error),
  });
}
