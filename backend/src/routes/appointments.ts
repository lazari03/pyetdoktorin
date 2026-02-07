import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { UserRole } from '@/domain/entities/UserRole';
import { createAppointment, listAppointmentsForUser, updateAppointmentStatus, getAppointmentById } from '@/services/appointmentsService';

const router = Router();

router.get('/', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const appointments = await listAppointmentsForUser(user.uid, user.role);
  res.json({ items: appointments });
});

router.post('/', requireAuth([UserRole.Patient]), async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { doctorId, doctorName, appointmentType, preferredDate, preferredTime, note } = req.body || {};
  if (!doctorId || !doctorName || !preferredDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const appointment = await createAppointment({
    patientId: user.uid,
    patientName: req.body.patientName || 'Patient',
    doctorId,
    doctorName,
    appointmentType,
    preferredDate,
    preferredTime,
    note,
  });
  res.status(201).json(appointment);
});

router.patch('/:id/status', requireAuth([UserRole.Doctor, UserRole.Admin]), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params as { id: string };
  const { status } = req.body || {};
  if (!status) {
    return res.status(400).json({ error: 'Missing status' });
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
