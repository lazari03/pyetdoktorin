import { Router } from 'express';
import type { Response } from 'express';
import express from 'express';
import crypto from 'crypto';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { env } from '@/config/env';

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
    if (key === 'ts') timestamp = value;
    if (key === 'h1' && value) signatures.push(value);
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

async function markAppointmentPaid(appointmentId: string, transactionId: string, status?: string) {
  const admin = getFirebaseAdmin();
  const db = admin.firestore();
  await db.runTransaction(async (tx) => {
    const appointmentRef = db.collection('appointments').doc(appointmentId);
    const paymentRef = db.collection('payments').doc(transactionId);
    const [appointmentSnap, paymentSnap] = await Promise.all([
      tx.get(appointmentRef),
      tx.get(paymentRef),
    ]);
    if (!appointmentSnap.exists) {
      throw new Error('Appointment not found');
    }
    if (paymentSnap.exists) {
      return;
    }
    const appointment = appointmentSnap.data() as { isPaid?: boolean; transactionId?: string };
    if (appointment.isPaid) {
      if (appointment.transactionId === transactionId) {
        return;
      }
      return;
    }
    tx.set(paymentRef, {
      appointmentId,
      transactionId,
      status: status ?? 'paid',
      provider: 'paddle',
      createdAt: Date.now(),
    });
    tx.set(appointmentRef, {
      isPaid: true,
      paymentStatus: 'paid',
      transactionId,
      paymentProvider: 'paddle',
      paidAt: Date.now(),
    }, { merge: true });
  });
}

function respond(res: Response, status: number, body: Record<string, unknown>) {
  return res.status(status).json(body);
}

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const secret = env.paddleWebhookSecret;
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
      await markAppointmentPaid(appointmentId, transactionId, data.status as string | undefined);
    } catch (error) {
      console.error('Paddle webhook error', error);
      return respond(res, 400, { error: 'Webhook processing failed' });
    }
  }

  return respond(res, 200, { ok: true });
});

export default router;
