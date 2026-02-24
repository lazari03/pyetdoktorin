import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { clinicsCatalog } from '@/data/clinics';
import { createClinicBooking, listBookingsByClinic, listBookingsByPatient, listAllBookings, updateClinicBookingStatus, getClinicBookingById, type ClinicBookingStatus } from '@/services/clinicBookingsService';
import { UserRole } from '@/domain/entities/UserRole';
import { buildDisplayName, getUserProfile } from '@/services/userProfileService';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { validateBody } from '@/routes/validation';

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
  const status = payload.status as ClinicBookingStatus;
  const user = (req as AuthenticatedRequest).user!;
  const booking = await getClinicBookingById(id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  if (user.role === UserRole.Clinic && booking.clinicId !== user.uid) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  await updateClinicBookingStatus(id, status);
  res.json({ ok: true });
});

export default router;
