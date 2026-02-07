import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { UserRole } from '@/domain/entities/UserRole';
import { createPrescription, listPrescriptionsForRole, updatePrescriptionStatus, getPrescriptionById, type PrescriptionInput } from '@/services/prescriptionsService';
import { buildDisplayName, getUserProfile } from '@/services/userProfileService';
import { z } from 'zod';

const router = Router();

const createPrescriptionSchema = z.object({
  patientId: z.string().min(1),
  patientName: z.string().min(1),
  pharmacyId: z.string().optional(),
  pharmacyName: z.string().optional(),
  medicines: z.array(z.string().min(1)).min(1),
  dosage: z.string().optional(),
  notes: z.string().optional(),
  title: z.string().optional(),
  signatureDataUrl: z.string().optional(),
  doctorName: z.string().optional(),
}).strict();

router.get('/', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const prescriptions = await listPrescriptionsForRole(user.uid, user.role);
  res.json({ items: prescriptions });
});

router.post('/', requireAuth([UserRole.Doctor]), async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const parsed = createPrescriptionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });
  }
  const { patientId, patientName, pharmacyId, pharmacyName, medicines, dosage, notes, title, signatureDataUrl, doctorName } = parsed.data;
  if (!patientId || !patientName || !Array.isArray(medicines) || medicines.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const [doctorProfile, patientProfile, pharmacyProfile] = await Promise.all([
    getUserProfile(user.uid),
    getUserProfile(patientId),
    pharmacyId ? getUserProfile(pharmacyId) : Promise.resolve(null),
  ]);
  const doctorDisplayName = buildDisplayName(doctorProfile, doctorName || 'Doctor');
  const patientDisplayName = buildDisplayName(patientProfile, patientName || 'Patient');
  const pharmacyDisplayName = pharmacyProfile?.pharmacyName ?? pharmacyName;
  const payload: PrescriptionInput = {
    doctorId: user.uid,
    doctorName: doctorDisplayName,
    patientId,
    patientName: patientDisplayName,
    medicines,
    ...(pharmacyId !== undefined ? { pharmacyId } : {}),
    ...(pharmacyDisplayName !== undefined ? { pharmacyName: pharmacyDisplayName } : {}),
    ...(dosage !== undefined ? { dosage } : {}),
    ...(notes !== undefined ? { notes } : {}),
    ...(title !== undefined ? { title } : {}),
    ...(signatureDataUrl !== undefined ? { signatureDataUrl } : {}),
  };
  const prescription = await createPrescription(payload);
  res.status(201).json(prescription);
});

router.patch('/:id/status', requireAuth([UserRole.Pharmacy, UserRole.Doctor, UserRole.Admin]), async (req, res) => {
  const { id } = req.params as { id: string };
  const { status } = req.body || {};
  if (!status) {
    return res.status(400).json({ error: 'Missing status' });
  }
  const user = (req as AuthenticatedRequest).user!;
  const prescription = await getPrescriptionById(id);
  if (!prescription) {
    return res.status(404).json({ error: 'Prescription not found' });
  }
  if (user.role === UserRole.Doctor && prescription.doctorId !== user.uid) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (user.role === UserRole.Pharmacy && prescription.pharmacyId !== user.uid) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  await updatePrescriptionStatus(id, status);
  res.json({ ok: true });
});

export default router;
