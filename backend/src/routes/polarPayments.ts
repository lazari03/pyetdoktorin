import { Router } from 'express';
import { z } from 'zod';
// Webhook helpers aren't re-exported from '@polar-sh/sdk' itself, only from
// this subpath — its type declarations live in src/types/polar-sdk.d.ts since
// this project's `moduleResolution: "node"` can't resolve the package's
// subpath `exports` map for type-checking (Node's own require() at runtime
// handles it fine).
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { UserRole } from '@/domain/entities/UserRole';
import { env } from '@/config/env';
import { polar, getOrCreateAppointmentProductId, getOrCreateWebhookSecret } from '@/services/polarClient';
import type { PresentmentCurrency } from '@polar-sh/sdk/dist/commonjs/models/components/presentmentcurrency';
import { getUserProfile } from '@/services/userProfileService';
import {
  getAppointmentById,
  markAppointmentPaymentProcessing,
  markAppointmentPaid,
  ensureAppointmentFee,
} from '@/services/appointmentsService';
import { AppointmentError, AppointmentErrorCode } from '@/errors/appointmentErrors';

// Two separate routers because the webhook needs the raw request body for
// signature verification and must be mounted before the app-wide
// express.json() in index.ts, while create-checkout needs the parsed JSON
// body and is mounted normally alongside every other route.

export const polarCheckoutRouter = Router();

const createCheckoutSchema = z.object({
  appointmentId: z.string().min(1),
});

polarCheckoutRouter.post('/create-checkout', requireAuth([UserRole.Patient, UserRole.Admin]), async (req: AuthenticatedRequest, res) => {
  const parsed = createCheckoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: AppointmentErrorCode.MissingRequiredFields, issues: parsed.error.issues });
  }
  const { appointmentId } = parsed.data;
  const user = req.user!;

  try {
    await markAppointmentPaymentProcessing(appointmentId, { uid: user.uid, role: user.role });

    const appointment = await getAppointmentById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: AppointmentErrorCode.NotFound });
    }
    if (!env.polarAccessToken) {
      return res.status(503).json({ error: 'PAYMENTS_NOT_CONFIGURED' });
    }
    const productId = await getOrCreateAppointmentProductId();
    let feeAmount = appointment.feeAmount;
    let feeCurrency = appointment.feeCurrency;
    if (!feeAmount) {
      // Appointments booked before fee-snapshotting existed have no stored
      // fee at all — backfill a default rather than leaving them unpayable.
      const doctorProfile = await getUserProfile(appointment.doctorId);
      const backfilled = await ensureAppointmentFee(
        appointmentId,
        doctorProfile?.consultationFee ?? env.appointmentPriceEur,
        env.appointmentPriceCurrency,
      );
      feeAmount = backfilled.feeAmount;
      feeCurrency = backfilled.feeCurrency;
    }

    const payerProfile = await getUserProfile(user.uid);
    const checkout = await polar.checkouts.create({
      products: [productId],
      amount: Math.round(feeAmount * 100),
      currency: (feeCurrency || 'EUR').toLowerCase() as PresentmentCurrency,
      successUrl: `${env.frontendUrl}/dashboard/appointments?paid=${appointmentId}`,
      ...(payerProfile?.email ? { customerEmail: payerProfile.email } : {}),
      metadata: { appointmentId },
    });

    res.json({ checkoutUrl: checkout.url });
  } catch (error) {
    if (error instanceof AppointmentError) {
      return res.status(error.status).json({ error: error.code });
    }
    console.error('Error creating Polar checkout:', error);
    res.status(500).json({ error: 'CHECKOUT_CREATE_FAILED' });
  }
});

export const polarWebhookRouter = Router();

polarWebhookRouter.post('/', async (req, res) => {
  let event;
  try {
    const webhookSecret = await getOrCreateWebhookSecret();
    event = validateEvent(req.body, req.headers as Record<string, string>, webhookSecret);
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return res.status(403).send('');
    }
    console.error('Error validating Polar webhook:', error);
    return res.status(400).send('');
  }

  if (event.type === 'order.paid') {
    const appointmentId = event.data.metadata?.appointmentId;
    if (typeof appointmentId === 'string' && appointmentId) {
      try {
        await markAppointmentPaid(appointmentId, event.data.id, 'polar', event.data.status);
      } catch (error) {
        console.error('Error marking appointment paid from Polar webhook:', error);
      }
    } else {
      console.error('Polar order.paid webhook missing appointmentId metadata', event.data.id);
    }
  }

  res.status(202).send('');
});
