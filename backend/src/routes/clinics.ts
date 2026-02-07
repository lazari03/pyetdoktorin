import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { clinicsCatalog } from '@/data/clinics';
import { createClinicBooking, listBookingsByClinic, listBookingsByPatient, listAllBookings, updateClinicBookingStatus, getClinicBookingById } from '@/services/clinicBookingsService';
import { UserRole } from '@/domain/entities/UserRole';
import { buildDisplayName, getUserProfile } from '@/services/userProfileService';

const router = Router();

router.get('/catalog', (_req, res) => {
  res.json({ items: clinicsCatalog });
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
  const { clinicId, clinicName, note, preferredDate } = req.body || {};
  if (!clinicId || !clinicName || !note) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const patientProfile = await getUserProfile(user.uid);
  const patientName = buildDisplayName(patientProfile, req.body.patientName || 'Patient');
  const patientEmail = patientProfile?.email ?? req.body.patientEmail ?? '';
  const patientPhone = patientProfile?.phone ?? req.body.patientPhone;
  const booking = await createClinicBooking({
    clinicId,
    clinicName,
    patientId: user.uid,
    patientName,
    patientEmail,
    patientPhone,
    note,
    preferredDate,
  });
  res.status(201).json(booking);
});

router.patch('/bookings/:id/status', requireAuth([UserRole.Admin, UserRole.Clinic]), async (req, res) => {
  const { id } = req.params as { id: string };
  const { status } = req.body || {};
  if (!status) {
    return res.status(400).json({ error: 'Missing status' });
  }
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
