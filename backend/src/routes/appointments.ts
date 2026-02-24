import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { UserRole } from '@/domain/entities/UserRole';
import {
  createAppointment,
  listAppointmentsForUser,
  updateAppointmentStatus,
  getAppointmentById,
  markAppointmentPaymentProcessing,
} from '@/services/appointmentsService';
import { buildDisplayName, getUserProfile } from '@/services/userProfileService';
import {
  AppointmentError,
  AppointmentErrorCode,
} from '@/errors/appointmentErrors';

const router = Router();

const createAppointmentSchema = z.object({
  doctorId: z.string().min(1),
  doctorName: z.string().min(1),
  appointmentType: z.string().optional(),
  preferredDate: z.string().min(1),
  preferredTime: z.string().min(1),
  note: z.string().optional(),
  notes: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.string().min(1),
});

router.get('/', requireAuth(), async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const appointments = await listAppointmentsForUser(user.uid, user.role);
    res.json({ items: appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: AppointmentErrorCode.FetchFailed });
  }
});

router.post('/', requireAuth([UserRole.Patient]), async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const parsed = createAppointmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: AppointmentErrorCode.MissingRequiredFields,
      issues: parsed.error.issues,
    });
  }
  const { doctorId, doctorName, appointmentType, preferredDate, preferredTime, note, notes } = parsed.data;
  const [patientProfile, doctorProfile] = await Promise.all([
    getUserProfile(user.uid),
    getUserProfile(doctorId),
  ]);
  const patientDisplayName = buildDisplayName(patientProfile, 'Patient');
  const doctorDisplayName = buildDisplayName(doctorProfile, doctorName || 'Doctor');
  try {
    const appointment = await createAppointment({
      patientId: user.uid,
      patientName: patientDisplayName,
      doctorId,
      doctorName: doctorDisplayName,
      appointmentType,
      preferredDate,
      preferredTime,
      note,
      notes,
    });
    res.status(201).json(appointment);
  } catch (error) {
    if (error instanceof AppointmentError) {
      return res.status(error.status).json({ error: error.code });
    }
    console.error('Error creating appointment:', error);
    return res.status(500).json({ error: AppointmentErrorCode.CreateFailed });
  }
});

router.patch('/:id/status', requireAuth([UserRole.Doctor, UserRole.Admin]), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params as { id: string };
  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: AppointmentErrorCode.StatusMissing,
      issues: parsed.error.issues,
    });
  }
  const { status } = parsed.data;
  const appointment = await getAppointmentById(id);
  if (!appointment) {
    return res.status(404).json({ error: AppointmentErrorCode.NotFound });
  }
  if (req.user!.role === UserRole.Doctor && appointment.doctorId !== req.user!.uid) {
    return res.status(403).json({ error: AppointmentErrorCode.Forbidden });
  }
  try {
    await updateAppointmentStatus(id, status, req.user!.role);
    res.json({ ok: true });
  } catch (error) {
    if (error instanceof AppointmentError) {
      return res.status(error.status).json({ error: error.code });
    }
    console.error('Error updating appointment status:', error);
    return res.status(500).json({ error: AppointmentErrorCode.UpdateFailed });
  }
});

router.get('/:id', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params as { id: string };
  const appointment = await getAppointmentById(id);
  if (!appointment) {
    return res.status(404).json({ error: AppointmentErrorCode.NotFound });
  }
  const user = req.user!;
  if (user.role !== UserRole.Admin && appointment.patientId !== user.uid && appointment.doctorId !== user.uid) {
    return res.status(403).json({ error: AppointmentErrorCode.Forbidden });
  }
  res.json(appointment);
});

router.post('/:id/payment-started', requireAuth([UserRole.Patient, UserRole.Admin]), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params as { id: string };
  try {
    await markAppointmentPaymentProcessing(id, { uid: req.user!.uid, role: req.user!.role });
    return res.json({ ok: true });
  } catch (error) {
    if (error instanceof AppointmentError) {
      return res.status(error.status).json({ error: error.code });
    }
    console.error('Error marking payment processing:', error);
    return res.status(500).json({ error: AppointmentErrorCode.UpdateFailed });
  }
});

export default router;
