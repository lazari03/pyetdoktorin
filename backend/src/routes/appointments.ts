import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { UserRole } from '@/domain/entities/UserRole';
import { createAppointment, listAppointmentsForUser, updateAppointmentStatus, getAppointmentById } from '@/services/appointmentsService';
import { buildDisplayName, getUserProfile } from '@/services/userProfileService';

const router = Router();

router.get('/', requireAuth(), async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const appointments = await listAppointmentsForUser(user.uid, user.role);
    res.json({ items: appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.post('/', requireAuth([UserRole.Patient]), async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { doctorId, doctorName, appointmentType, preferredDate, preferredTime, note, notes } = req.body || {};
  if (!doctorId || !doctorName || !preferredDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const [patientProfile, doctorProfile] = await Promise.all([
    getUserProfile(user.uid),
    getUserProfile(doctorId),
  ]);
  const patientDisplayName = buildDisplayName(patientProfile, 'Patient');
  const doctorDisplayName = buildDisplayName(doctorProfile, doctorName || 'Doctor');
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
});

router.patch('/:id/status', requireAuth([UserRole.Doctor, UserRole.Admin]), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params as { id: string };
  const { status } = req.body || {};
  if (!status) {
    return res.status(400).json({ error: 'Missing status' });
  }
  const appointment = await getAppointmentById(id);
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  if (req.user!.role === UserRole.Doctor && appointment.doctorId !== req.user!.uid) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  await updateAppointmentStatus(id, status, req.user!.role);
  res.json({ ok: true });
});

router.get('/:id', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params as { id: string };
  const appointment = await getAppointmentById(id);
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  const user = req.user!;
  if (user.role !== UserRole.Admin && appointment.patientId !== user.uid && appointment.doctorId !== user.uid) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(appointment);
});

export default router;
