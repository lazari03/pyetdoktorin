import { Router } from 'express';
import type { Response } from 'express';
import express from 'express';
import crypto from 'crypto';
import { env } from '@/config/env';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { UserRole } from '@/domain/entities/UserRole';
import { z } from 'zod';
import { validateBody } from '@/routes/validation';
import { getAppointmentById, markAppointmentPaid } from '@/services/appointmentsService';

const router = Router();

type PaddleEvent = {
  event_id?: string;
  event_type?: string;
  data?: Record<string, unknown>;
};

function parseSignature(header: string) {
  const parts = header.split(';').map((part) => part.trim());
  let timestamp = '';
  const signatures: string[] = [];
  for (const part of parts) {
    const [key, value = ''] = part.split('=');
    if ((key === 'ts' || key === 't') && value) timestamp = value;
    if ((key === 'h1' || key === 'v1') && value) signatures.push(value);
  }
  return { timestamp, signatures };
}

function verifySignature(rawBody: Buffer, header: string, secret: string) {
  const { timestamp, signatures } = parseSignature(header);
  if (!timestamp || signatures.length === 0) return false;
  const payload = `${timestamp}:${rawBody.toString('utf8')}`;
  const digest = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const digestBuf = Buffer.from(digest, 'hex');
  return signatures.some((sig) => {
    const sigBuf = Buffer.from(sig, 'hex');
    if (sigBuf.length !== digestBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, digestBuf);
  });
}

function respond(res: Response, status: number, body: Record<string, unknown>) {
  return res.status(status).json(body);
}

async function fetchPaddleTransactions(apiKey: string) {
  const envMode = (env.paddleEnv || 'sandbox').toLowerCase();
  const baseUrl = envMode === 'sandbox' ? 'https://sandbox-api.paddle.com' : 'https://api.paddle.com';
  const url = new URL(`${baseUrl}/transactions`);
  url.searchParams.set('per_page', '50');
  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Paddle API error (${response.status})`);
  }
  const payload = (await response.json()) as Record<string, unknown>;
  const data = (payload as { data?: unknown[] }).data;
  const items = (payload as { items?: unknown[] }).items;
  return (Array.isArray(data) ? data : Array.isArray(items) ? items : []) as Array<Record<string, unknown>>;
}

router.post('/sync', express.json(), requireAuth([UserRole.Patient, UserRole.Admin, UserRole.Doctor]), async (req: AuthenticatedRequest, res) => {
  const payload = validateBody(res, z.object({ appointmentId: z.string().min(1) }), req.body, 'MISSING_APPOINTMENT_ID');
  if (!payload) return;
  const { appointmentId } = payload;
  const apiKey = env.paddleApiKey;
  if (!apiKey) {
    return respond(res, 500, { error: 'Missing Paddle API key' });
  }

  const appointment = await getAppointmentById(appointmentId);
  if (!appointment) {
    return respond(res, 404, { error: 'Appointment not found' });
  }
  const requester = req.user;
  if (requester?.role === UserRole.Patient && appointment.patientId !== requester.uid) {
    return respond(res, 403, { error: 'Forbidden' });
  }
  if (requester?.role === UserRole.Doctor && appointment.doctorId !== requester.uid) {
    return respond(res, 403, { error: 'Forbidden' });
  }

  if (appointment.isPaid) {
    return respond(res, 200, { ok: true, updated: false, isPaid: true });
  }

  try {
    const transactions = await fetchPaddleTransactions(apiKey);
    const match = transactions.find((tx) => {
      const customData = (tx.custom_data as Record<string, unknown> | undefined)
        ?? (tx.customData as Record<string, unknown> | undefined);
      const appointmentMatch =
        (customData?.appointmentId as string | undefined) ??
        (customData?.appointment_id as string | undefined);
      return appointmentMatch === appointmentId;
    });
    if (!match) {
      return respond(res, 200, { ok: true, updated: false, isPaid: false });
    }
    const transactionId =
      (match.id as string | undefined) ??
      (match.transaction_id as string | undefined) ??
      (match.transactionId as string | undefined);
    if (!transactionId) {
      return respond(res, 200, { ok: true, updated: false, isPaid: false });
    }
    await markAppointmentPaid(appointmentId, transactionId, 'paddle', match.status as string | undefined);
    return respond(res, 200, { ok: true, updated: true, isPaid: true });
  } catch (error) {
    console.error('Paddle sync error', error);
    return respond(res, 500, { error: 'Failed to sync payment' });
  }
});

// Raw body is already attached by the app-level express.raw() mount for this
// exact path in index.ts (must run before the global express.json()).
router.post('/webhook', async (req, res) => {
  const secret = env.paddleWebhookSecret
    ? env.paddleWebhookSecret.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1')
    : '';
  if (!secret) {
    return respond(res, 500, { error: 'Missing Paddle webhook secret' });
  }
  const signature = req.header('Paddle-Signature') || '';
  if (!signature) {
    return respond(res, 401, { error: 'Missing Paddle signature' });
  }
  const rawBody = req.body as Buffer;
  if (!Buffer.isBuffer(rawBody)) {
    return respond(res, 500, { error: 'Webhook body not available' });
  }
  const valid = verifySignature(rawBody, signature, secret);
  if (!valid) {
    return respond(res, 401, { error: 'Invalid Paddle signature' });
  }

  let event: PaddleEvent;
  try {
    event = JSON.parse(rawBody.toString('utf8')) as PaddleEvent;
  } catch (error) {
    console.error('Invalid Paddle payload', error);
    return respond(res, 400, { error: 'Invalid payload' });
  }

  if (event.event_type === 'transaction.completed') {
    const data = event.data ?? {};
    const customData = (data.custom_data as Record<string, unknown> | undefined)
      ?? (data.customData as Record<string, unknown> | undefined);
    const appointmentId =
      (customData?.appointmentId as string | undefined) ??
      (customData?.appointment_id as string | undefined);
    const transactionId = (data.id as string | undefined) ?? (data.transaction_id as string | undefined);
    if (!appointmentId || !transactionId) {
      return respond(res, 200, { ok: true });
    }
    try {
      await markAppointmentPaid(appointmentId, transactionId, 'paddle', data.status as string | undefined);
    } catch (error) {
      console.error('Paddle webhook error', error);
      return respond(res, 400, { error: 'Webhook processing failed' });
    }
  }

  return respond(res, 200, { ok: true });
});

export default router;
