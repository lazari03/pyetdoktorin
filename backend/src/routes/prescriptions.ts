import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { UserRole } from '@/domain/entities/UserRole';
import { createPrescription, listPrescriptionsForRole, updatePrescriptionStatus, getPrescriptionById, type PrescriptionInput, type PrescriptionStatus } from '@/services/prescriptionsService';
import { buildDisplayName, getUserProfile } from '@/services/userProfileService';
import { z } from 'zod';
import { validateBody } from '@/routes/validation';

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

const updatePrescriptionStatusSchema = z.object({
  status: z.string().min(1),
});

router.get('/', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const prescriptions = await listPrescriptionsForRole(user.uid, user.role);
  res.json({ items: prescriptions });
});

router.post('/', requireAuth([UserRole.Doctor]), async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const requestPayload = validateBody(res, createPrescriptionSchema, req.body, 'INVALID_PAYLOAD');
  if (!requestPayload) return;
  const { patientId, patientName, pharmacyId, pharmacyName, medicines, dosage, notes, title, signatureDataUrl, doctorName } = requestPayload;
  const [doctorProfile, patientProfile, pharmacyProfile] = await Promise.all([
    getUserProfile(user.uid),
    getUserProfile(patientId),
    pharmacyId ? getUserProfile(pharmacyId) : Promise.resolve(null),
  ]);
  const doctorDisplayName = buildDisplayName(doctorProfile, doctorName || 'Doctor');
  const patientDisplayName = buildDisplayName(patientProfile, patientName || 'Patient');
  const pharmacyDisplayName = pharmacyProfile?.pharmacyName ?? pharmacyName;
  const prescriptionInput: PrescriptionInput = {
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
  const prescription = await createPrescription(prescriptionInput);
  res.status(201).json(prescription);
});

router.patch('/:id/status', requireAuth([UserRole.Pharmacy, UserRole.Doctor, UserRole.Admin]), async (req, res) => {
  const { id } = req.params as { id: string };
  const requestPayload = validateBody(res, updatePrescriptionStatusSchema, req.body, 'MISSING_STATUS');
  if (!requestPayload) return;
  const status = requestPayload.status as PrescriptionStatus;
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
