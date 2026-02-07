import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { UserRole } from '@/domain/entities/UserRole';
import { createPayPalOrder, capturePayPalOrder } from '@/services/paymentsService';
import { getAppointmentById } from '@/services/appointmentsService';
import { env } from '@/config/env';

const router = Router();

const PAYWALL_AMOUNT = env.paywallAmountUsd;

router.post('/create-order', requireAuth([UserRole.Patient]), async (req: AuthenticatedRequest, res) => {
  const { appointmentId } = req.body || {};
  if (!appointmentId) {
    return res.status(400).json({ error: 'Missing appointmentId' });
  }
  const appointment = await getAppointmentById(appointmentId);
  if (!appointment || appointment.patientId !== req.user!.uid) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  if (appointment.isPaid) {
    return res.status(409).json({ error: 'Appointment already paid' });
  }
  const order = await createPayPalOrder(PAYWALL_AMOUNT, appointmentId);
  res.json(order);
});

router.post('/capture-order', requireAuth([UserRole.Patient]), async (req: AuthenticatedRequest, res) => {
  const { orderId, appointmentId } = req.body || {};
  if (!orderId || !appointmentId) {
    return res.status(400).json({ error: 'Missing orderId or appointmentId' });
  }
  const appointment = await getAppointmentById(appointmentId);
  if (!appointment || appointment.patientId !== req.user!.uid) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  if (appointment.isPaid) {
    return res.status(409).json({ error: 'Appointment already paid' });
  }
  const capture = await capturePayPalOrder(orderId, appointmentId, PAYWALL_AMOUNT);
  res.json(capture);
});

export default router;
