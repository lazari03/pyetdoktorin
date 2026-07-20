import { Router } from 'express';
import { z } from 'zod';
import { env } from '@/config/env';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { UserRole } from '@/domain/entities/UserRole';
import { validateBody } from '@/routes/validation';
import { paypalFetch, PayPalApiError } from '@/services/paypalClient';
import { getAppointmentById, markAppointmentPaid } from '@/services/appointmentsService';

const router = Router();

// PayPal "issue" codes that mean the payment was legitimately refused (by
// PayPal's risk/compliance systems, the card issuer, or the payer's own
// account) — worth telling the user clearly, as opposed to an unexpected
// technical failure on our side.
const DECLINE_ISSUES = new Set([
  'COMPLIANCE_VIOLATION',
  'INSTRUMENT_DECLINED',
  'TRANSACTION_REFUSED',
  'PAYER_CANNOT_PAY',
  'RESTRICTED_TRANSACTION',
  'PAYER_ACCOUNT_RESTRICTED',
  'PAYEE_ACCOUNT_RESTRICTED',
  'CARD_CLOSED',
  'DECLINED',
]);

const createOrderSchema = z.object({ appointmentId: z.string().min(1) });
const captureOrderSchema = z.object({ appointmentId: z.string().min(1), orderId: z.string().min(1) });

function isOwner(appointment: { patientId?: string; doctorId?: string }, requester: { uid: string; role: UserRole }) {
  if (requester.role === UserRole.Admin) return true;
  if (requester.role === UserRole.Patient) return appointment.patientId === requester.uid;
  if (requester.role === UserRole.Doctor) return appointment.doctorId === requester.uid;
  return false;
}

router.post('/create-order', requireAuth([UserRole.Patient, UserRole.Admin, UserRole.Doctor]), async (req: AuthenticatedRequest, res) => {
  const payload = validateBody(res, createOrderSchema, req.body, 'MISSING_APPOINTMENT_ID');
  if (!payload) return;
  const { appointmentId } = payload;

  const appointment = await getAppointmentById(appointmentId);
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  if (!isOwner(appointment, req.user!)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (appointment.isPaid) {
    return res.status(409).json({ error: 'Appointment already paid' });
  }

  try {
    const feeAmount = appointment.feeAmount ?? env.appointmentPriceEur;
    const feeCurrency = appointment.feeCurrency ?? env.appointmentPriceCurrency;
    const order = await paypalFetch<{ id: string }>('/v2/checkout/orders', {
      method: 'POST',
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            custom_id: appointmentId,
            amount: {
              currency_code: feeCurrency,
              value: feeAmount.toFixed(2),
            },
          },
        ],
      }),
    });
    return res.json({ orderId: order.id });
  } catch (error) {
    if (error instanceof PayPalApiError) {
      console.error('PayPal create-order error', { appointmentId, issue: error.issue, debugId: error.body?.debug_id });
    } else {
      console.error('PayPal create-order error', error);
    }
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

router.post('/capture-order', requireAuth([UserRole.Patient, UserRole.Admin, UserRole.Doctor]), async (req: AuthenticatedRequest, res) => {
  const payload = validateBody(res, captureOrderSchema, req.body, 'MISSING_ORDER_ID');
  if (!payload) return;
  const { appointmentId, orderId } = payload;

  const appointment = await getAppointmentById(appointmentId);
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  if (!isOwner(appointment, req.user!)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (appointment.isPaid) {
    return res.json({ ok: true, status: 'COMPLETED' });
  }

  try {
    const capture = await paypalFetch<{
      status: string;
      purchase_units?: Array<{ payments?: { captures?: Array<{ id: string; status: string }> } }>;
    }>(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, { method: 'POST' });

    const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    const captureStatus = capture.purchase_units?.[0]?.payments?.captures?.[0]?.status ?? capture.status;

    if (captureStatus === 'COMPLETED' && captureId) {
      await markAppointmentPaid(appointmentId, captureId, 'paypal', captureStatus);
      return res.json({ ok: true, status: captureStatus });
    }

    // PayPal returned 200 but the capture itself didn't complete (e.g.
    // DECLINED, PENDING for review) — this is not success, don't tell the
    // frontend it is.
    console.error('PayPal capture did not complete', { appointmentId, orderId, captureStatus });
    return res.status(402).json({ error: 'PAYMENT_NOT_COMPLETED', status: captureStatus });
  } catch (error) {
    if (error instanceof PayPalApiError) {
      console.error('PayPal capture-order declined', {
        appointmentId,
        orderId,
        issue: error.issue,
        debugId: error.body?.debug_id,
      });
      if (error.issue && DECLINE_ISSUES.has(error.issue)) {
        return res.status(402).json({ error: 'PAYMENT_DECLINED', issue: error.issue });
      }
    } else {
      console.error('PayPal capture-order error', error);
    }
    return res.status(500).json({ error: 'Failed to capture order' });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const verification = await paypalFetch<{ verification_status: string }>('/v1/notifications/verify-webhook-signature', {
      method: 'POST',
      body: JSON.stringify({
        auth_algo: req.header('PAYPAL-AUTH-ALGO'),
        cert_url: req.header('PAYPAL-CERT-URL'),
        transmission_id: req.header('PAYPAL-TRANSMISSION-ID'),
        transmission_sig: req.header('PAYPAL-TRANSMISSION-SIG'),
        transmission_time: req.header('PAYPAL-TRANSMISSION-TIME'),
        webhook_id: env.paypalWebhookId,
        webhook_event: req.body,
      }),
    });
    if (verification.verification_status !== 'SUCCESS') {
      return res.status(401).json({ error: 'Invalid PayPal webhook signature' });
    }
  } catch (error) {
    console.error('PayPal webhook verification error', error);
    return res.status(401).json({ error: 'Webhook verification failed' });
  }

  const event = req.body as { event_type?: string; resource?: { custom_id?: string; id?: string; status?: string } };
  if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    const appointmentId = event.resource?.custom_id;
    const captureId = event.resource?.id;
    if (appointmentId && captureId) {
      try {
        await markAppointmentPaid(appointmentId, captureId, 'paypal', event.resource?.status);
      } catch (error) {
        console.error('PayPal webhook processing error', error);
        return res.status(400).json({ error: 'Webhook processing failed' });
      }
    }
  }

  return res.json({ ok: true });
});

export default router;
