import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env';
import authRouter from '@/routes/auth';
import blogRouter from '@/routes/blog';
import usersRouter from '@/routes/users';
import appointmentsRouter from '@/routes/appointments';
import prescriptionsRouter from '@/routes/prescriptions';
import clinicsRouter from '@/routes/clinics';
import paddleRouter from '@/routes/paddle';
import statsRouter from '@/routes/stats';
import notificationsRouter from '@/routes/notifications';
import availabilityRouter from '@/routes/availability';
import doctorsRouter from '@/routes/doctors';
import securityLogsRouter from '@/routes/securityLogs';
import { createRateLimiter } from '@/middleware/rateLimit';
import { attachRequestContext } from '@/middleware/requestContext';
import { logEvent, logRequestError } from '@/utils/logging';

const app = express();

app.use(helmet());
const isProd = process.env.NODE_ENV === 'production';
const allowedOrigins = [
  ...env.corsOrigins,
  env.frontendUrl,
]
  .filter(Boolean)
  .map((origin) => origin.replace(/\/$/, ''));
const allowAllOrigins = !isProd && allowedOrigins.length === 0;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (!isProd && /^(http:\/\/localhost|http:\/\/127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    if (allowAllOrigins) {
      return callback(null, true);
    }
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    if (!isProd) {
      console.warn('CORS blocked origin:', origin);
      return callback(null, false);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(attachRequestContext);

const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 150, keyPrefix: 'auth' });
const writeLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 120, keyPrefix: 'write' });
const readLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 600, keyPrefix: 'read' });
const webhookLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 300, keyPrefix: 'webhook' });

app.use('/api/auth', authLimiter);
app.use('/api/appointments', writeLimiter);
app.use('/api/paddle/webhook', webhookLimiter);
app.use('/api/paddle/sync', writeLimiter);
app.use('/api/users', readLimiter);
app.use('/api/blog', readLimiter);
app.use('/api/clinics', readLimiter);
app.use('/api/prescriptions', readLimiter);
app.use('/api/notifications', readLimiter);
app.use('/api/stats', readLimiter);
app.use('/api/availability', readLimiter);
app.use('/api/doctors', readLimiter);
app.use('/api/security-logs', readLimiter);
app.use('/api/paddle', paddleRouter);
app.use(express.json());
app.use(cookieParser());
morgan.token('request-id', (req) => (req as express.Request).requestId ?? '-');
app.use(morgan((tokens, req, res) => JSON.stringify({
  event: 'http_request',
  requestId: tokens['request-id']?.(req, res) ?? '-',
  method: tokens.method?.(req, res) ?? 'UNKNOWN',
  path: tokens.url?.(req, res) ?? '',
  status: Number(tokens.status?.(req, res) || 0),
  durationMs: Number(tokens['response-time']?.(req, res) || 0),
  responseBytes: Number(tokens.res?.(req, res, 'content-length') || 0),
})));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', authRouter);
app.use('/api/blog', blogRouter);
app.use('/api/users', usersRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/prescriptions', prescriptionsRouter);
app.use('/api/clinics', clinicsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/security-logs', securityLogsRouter);

app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Ensure CORS headers are present on error responses so the browser
  // can read the error instead of reporting a missing CORS header.
  const origin = req.headers.origin;
  if (origin) {
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (allowAllOrigins || allowedOrigins.includes(normalizedOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  }
  logRequestError('unhandled_error', req, err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(env.port, () => {
  logEvent('info', 'backend_started', { port: env.port });
});
