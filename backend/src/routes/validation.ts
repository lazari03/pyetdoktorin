import type { Response } from 'express';
import type { ZodSchema } from 'zod';

export function validateBody<T>(
  res: Response,
  schema: ZodSchema<T>,
  body: unknown,
  errorCode: string
): T | null {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    res.status(400).json({ error: errorCode, issues: parsed.error.issues });
    return null;
  }
  return parsed.data;
}

export function validateQuery<T>(
  res: Response,
  schema: ZodSchema<T>,
  query: unknown,
  errorCode: string
): T | null {
  const parsed = schema.safeParse(query);
  if (!parsed.success) {
    res.status(400).json({ error: errorCode, issues: parsed.error.issues });
    return null;
  }
  return parsed.data;
}
