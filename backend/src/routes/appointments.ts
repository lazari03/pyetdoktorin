import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { UserRole } from '@/domain/entities/UserRole';
import { validateQuery } from '@/routes/validation';
import {
  createAppointment,
  listAppointmentsForUser,
  updateAppointmentStatus,
  getAppointmentById,
  markAppointmentPaymentProcessing,
  clearAppointmentPaymentProcessing,
  type AppointmentStatus,
} from '@/services/appointmentsService';
import { buildDisplayName, getUserProfile } from '@/services/userProfileService';
import { findQuickAppointmentMatches } from '@/services/quickAppointmentsService';
import { env } from '@/config/env';
import {
  AppointmentError,
  AppointmentErrorCode,
} from '@/errors/appointmentErrors';
import { getFamilyMember } from '@/services/familyService';
import { FamilyMemberError } from '@/errors/familyErrors';

const router = Router();

const createAppointmentSchema = z.object({
  doctorId: z.string().min(1),
  doctorName: z.string().min(1),
  appointmentType: z.string().optional(),
  preferredDate: z.string().min(1),
  preferredTime: z.string().min(1),
  note: z.string().optional(),
  notes: z.string().optional(),
  bookingFor: z.enum(['self', 'family']).default('self'),
  familyMemberId: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.string().min(1),
});

const quickAppointmentQuerySchema = z.object({
  specialty: z.string().optional(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

router.get('/', requireAuth([UserRole.Patient, UserRole.Doctor, UserRole.Admin]), async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const appointments = await listAppointmentsForUser(user.uid, user.role);
    res.json({ items: appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: AppointmentErrorCode.FetchFailed });
  }
});

router.get('/quick-match', requireAuth([UserRole.Patient]), async (req: AuthenticatedRequest, res) => {
  const query = validateQuery(res, quickAppointmentQuerySchema, req.query, 'INVALID_QUERY');
  if (!query) return;

  try {
    const result = await findQuickAppointmentMatches({
      patientId: req.user!.uid,
      ...(query.specialty !== undefined ? { specialty: query.specialty } : {}),
      ...(query.preferredDate !== undefined ? { preferredDate: query.preferredDate } : {}),
      ...(query.preferredTime !== undefined ? { preferredTime: query.preferredTime } : {}),
      ...(query.limit !== undefined ? { limit: query.limit } : {}),
    });
    res.json(result);
  } catch (error) {
    console.error('Error building quick appointment matches:', error);
    res.status(500).json({ error: 'QUICK_APPOINTMENT_MATCH_FAILED' });
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
  const { doctorId, doctorName, appointmentType, preferredDate, preferredTime, note, notes, bookingFor, familyMemberId } = parsed.data;
  const [patientProfile, doctorProfile] = await Promise.all([
    getUserProfile(user.uid),
    getUserProfile(doctorId),
  ]);
  const patientDisplayName = buildDisplayName(patientProfile, 'Patient');
  const doctorDisplayName = buildDisplayName(doctorProfile, doctorName || 'Doctor');

  let patientId: string | undefined = user.uid;
  let patientName: string = patientDisplayName;
  let resolvedFamilyMemberId: string | undefined;

  if (bookingFor === 'family') {
    if (!familyMemberId) {
      return res.status(400).json({ error: AppointmentErrorCode.MissingRequiredFields });
    }
    const familyMember = await getFamilyMember(familyMemberId);
    if (!familyMember || familyMember.ownerUserId !== user.uid || familyMember.status === 'declined') {
      return res.status(403).json({ error: AppointmentErrorCode.Forbidden });
    }
    patientId = familyMember.linkedUserId;
    patientName = [familyMember.name, familyMember.surname].filter(Boolean).join(' ');
    resolvedFamilyMemberId = familyMember.id;
  }

  try {
    const appointmentInput = {
      ...(patientId !== undefined ? { patientId } : {}),
      patientName,
      requesterId: user.uid,
      requesterName: patientDisplayName,
      payerId: user.uid,
      ...(resolvedFamilyMemberId !== undefined ? { familyMemberId: resolvedFamilyMemberId } : {}),
      doctorId,
      doctorName: doctorDisplayName,
      preferredDate,
      preferredTime,
      // Snapshot the doctor's current fee at booking time so later changes to
      // their rate don't retroactively affect appointments already requested.
      feeAmount: doctorProfile?.consultationFee ?? env.appointmentPriceEur,
      feeCurrency: env.appointmentPriceCurrency,
      ...(appointmentType !== undefined ? { appointmentType } : {}),
      ...(note !== undefined ? { note } : {}),
      ...(notes !== undefined ? { notes } : {}),
    };
    const appointment = await createAppointment(appointmentInput);
    res.status(201).json(appointment);
  } catch (error) {
    if (error instanceof AppointmentError || error instanceof FamilyMemberError) {
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
  const status = parsed.data.status as AppointmentStatus;
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
  if (
    user.role !== UserRole.Admin &&
    appointment.patientId !== user.uid &&
    appointment.requesterId !== user.uid &&
    appointment.doctorId !== user.uid
  ) {
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

router.post('/:id/payment-cancelled', requireAuth([UserRole.Patient, UserRole.Admin]), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params as { id: string };
  try {
    await clearAppointmentPaymentProcessing(id, { uid: req.user!.uid, role: req.user!.role });
    return res.json({ ok: true });
  } catch (error) {
    if (error instanceof AppointmentError) {
      return res.status(error.status).json({ error: error.code });
    }
    console.error('Error clearing payment processing:', error);
    return res.status(500).json({ error: AppointmentErrorCode.UpdateFailed });
  }
});

export default router;
