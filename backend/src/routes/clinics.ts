import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { clinicsCatalog } from '@/data/clinics';
import { createClinicBooking, listBookingsByClinic, listBookingsByPatient, listAllBookings, updateClinicBookingStatus, getClinicBookingById, isClinicBookingStatus, type ClinicBookingStatus } from '@/services/clinicBookingsService';
import { UserRole } from '@/domain/entities/UserRole';
import { buildDisplayName, getUserProfile } from '@/services/userProfileService';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { validateBody } from '@/routes/validation';
import {
  resolveSecurityAccountSummary,
  type SecurityAccountSummary,
  writeSecurityAuditLog,
} from '@/services/securityAuditService';
import { logRequestError } from '@/utils/logging';

const router = Router();

const createBookingSchema = z.object({
  clinicId: z.string().min(1),
  clinicName: z.string().min(1),
  note: z.string().min(1),
  preferredDate: z.string().optional(),
  patientName: z.string().optional(),
  patientEmail: z.string().optional(),
  patientPhone: z.string().optional(),
});

const updateBookingStatusSchema = z.object({
  status: z.string().min(1),
});

async function resolveActorSummary(req: AuthenticatedRequest): Promise<SecurityAccountSummary | undefined> {
  if (!req.user) return undefined;
  try {
    const summary = await resolveSecurityAccountSummary(req.user.uid);
    return {
      ...summary,
      role: summary.role ?? req.user.role,
    };
  } catch {
    return {
      userId: req.user.uid,
      role: req.user.role,
    };
  }
}

router.get('/catalog', (_req, res) => {
  res.json({ items: clinicsCatalog });
});

router.get('/private', requireAuth([UserRole.Patient, UserRole.Admin]), async (_req: AuthenticatedRequest, res) => {
  const admin = getFirebaseAdmin();
  const snapshot = await admin.firestore().collection('users').where('role', '==', UserRole.Clinic).get();
  const items = snapshot.docs.map((doc) => {
    const data = doc.data() as Record<string, unknown>;
    const clinicName = (data.clinicName as string | undefined) ?? '';
    const name = clinicName || `${(data.name as string | undefined) ?? ''} ${(data.surname as string | undefined) ?? ''}`.trim() || 'Clinic';
    const specialization = data.specialization as string | undefined;
    const specializations = Array.isArray(data.specializations) ? (data.specializations as string[]) : [];
    const specialties = specializations.length > 0 ? specializations : (specialization ? [specialization] : []);
    return {
      id: doc.id,
      name,
      address: (data.address as string | undefined) ?? '',
      description: (data.bio as string | undefined) ?? (data.about as string | undefined) ?? '',
      specialties,
      phone: (data.phone as string | undefined) ?? '',
      email: (data.email as string | undefined) ?? '',
      imageUrl: (data.imageUrl as string | undefined) ?? undefined,
    };
  });
  res.json({ items });
});

router.get('/bookings', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  if (user.role === UserRole.Admin) {
    const { clinicId, patientId } = req.query as { clinicId?: string; patientId?: string };
    if (patientId) {
      const items = await listBookingsByPatient(patientId);
      return res.json({ items });
    }
    if (clinicId) {
      const items = await listBookingsByClinic(clinicId);
      return res.json({ items });
    }
    const items = await listAllBookings();
    return res.json({ items });
  }
  if (user.role === UserRole.Clinic) {
    const items = await listBookingsByClinic(user.uid);
    return res.json({ items });
  }
  const items = await listBookingsByPatient(user.uid);
  return res.json({ items });
});

router.post('/bookings', requireAuth([UserRole.Patient]), async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const payload = validateBody(res, createBookingSchema, req.body, 'MISSING_REQUIRED_FIELDS');
  if (!payload) return;
  const { clinicId, clinicName, note, preferredDate, patientName, patientEmail, patientPhone } = payload;
  const patientProfile = await getUserProfile(user.uid);
  const displayName = buildDisplayName(patientProfile, patientName || 'Patient');
  const displayEmail = patientProfile?.email ?? patientEmail ?? '';
  const displayPhone = patientProfile?.phone ?? patientPhone;
  const bookingInput = {
    clinicId,
    clinicName,
    patientId: user.uid,
    patientName: displayName,
    patientEmail: displayEmail,
    note,
    ...(displayPhone !== undefined ? { patientPhone: displayPhone } : {}),
    ...(preferredDate !== undefined ? { preferredDate } : {}),
  };
  const booking = await createClinicBooking(bookingInput);
  res.status(201).json(booking);
});

router.patch('/bookings/:id/status', requireAuth([UserRole.Admin, UserRole.Clinic]), async (req, res) => {
  const { id } = req.params as { id: string };
  const payload = validateBody(res, updateBookingStatusSchema, req.body, 'MISSING_STATUS');
  if (!payload) return;
  if (!isClinicBookingStatus(payload.status)) {
    return res.status(400).json({ error: 'INVALID_STATUS' });
  }
  const status: ClinicBookingStatus = payload.status;
  const user = (req as AuthenticatedRequest).user!;
  const actor = await resolveActorSummary(req as AuthenticatedRequest);
  const booking = await getClinicBookingById(id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  if (user.role === UserRole.Clinic && booking.clinicId !== user.uid) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    await updateClinicBookingStatus(id, status);
    try {
      await writeSecurityAuditLog({
        type: 'clinic_booking_status_updated',
        success: true,
        request: req,
        user: actor,
        metadata: {
          bookingId: id,
          clinicId: booking.clinicId,
          patientId: booking.patientId,
          status,
        },
      });
    } catch (auditError) {
      logRequestError('clinic_booking_audit_write_failed', req, auditError, { bookingId: id });
    }
    res.json({ ok: true });
  } catch (error) {
    try {
      await writeSecurityAuditLog({
        type: 'clinic_booking_status_updated',
        success: false,
        request: req,
        user: actor,
        reason: error instanceof Error ? error.message : 'Failed to update clinic booking status',
        metadata: {
          bookingId: id,
          clinicId: booking.clinicId,
          patientId: booking.patientId,
          status,
        },
      });
    } catch (auditError) {
      logRequestError('clinic_booking_audit_write_failed', req, auditError, { bookingId: id });
    }
    logRequestError('clinic_booking_status_update_failed', req, error, { bookingId: id });
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

export default router;
