import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { UserRole } from '@/domain/entities/UserRole';
import { createPrescription, listPrescriptionsForRole, updatePrescriptionStatus, getPrescriptionById, type PrescriptionInput, type PrescriptionType } from '@/services/prescriptionsService';
import { buildDisplayName, getUserProfile } from '@/services/userProfileService';
import { z } from 'zod';
import { validateBody } from '@/routes/validation';

const router = Router();

const createPrescriptionSchema = z.object({
  patientId: z.string().min(1),
  patientName: z.string().min(1),
  type: z.enum(['standard', 'reimbursement']).optional(),
  reimbursementCode: z.string().trim().min(1).optional(),
  pharmacyId: z.string().optional(),
  pharmacyName: z.string().optional(),
  medicines: z.array(z.string().min(1)).optional(),
  dosage: z.string().optional(),
  notes: z.string().optional(),
  title: z.string().optional(),
  signatureDataUrl: z.string().optional(),
  doctorName: z.string().optional(),
}).strict();

const updatePrescriptionStatusSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected']),
});

const REAUTH_WINDOW_MS = 5 * 60 * 1000;

router.get('/', requireAuth([UserRole.Patient, UserRole.Doctor, UserRole.Pharmacy, UserRole.Admin]), async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const prescriptions = await listPrescriptionsForRole(user.uid, user.role);
  res.json({ items: prescriptions });
});

router.post('/', requireAuth([UserRole.Doctor]), async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const authTime = user.authTime ?? 0;
  if (!authTime || Date.now() - authTime > REAUTH_WINDOW_MS) {
    return res.status(401).json({ error: 'REAUTH_REQUIRED' });
  }
  const requestPayload = validateBody(res, createPrescriptionSchema, req.body, 'INVALID_PAYLOAD');
  if (!requestPayload) return;
  const { patientId, patientName, type, reimbursementCode, pharmacyId, pharmacyName, medicines, dosage, notes, title, doctorName } = requestPayload;
  const normalizedType: PrescriptionType = type ?? 'standard';
  const normalizedPharmacyName = pharmacyName?.trim();

  if (normalizedType === 'reimbursement' && !reimbursementCode) {
    return res.status(400).json({ error: 'MISSING_REIMBURSEMENT_CODE' });
  }
  if (normalizedType === 'reimbursement' && !normalizedPharmacyName) {
    return res.status(400).json({ error: 'MISSING_REIMBURSEMENT_PHARMACY_NAME' });
  }
  if (normalizedType === 'standard' && (!medicines || medicines.length === 0)) {
    return res.status(400).json({ error: 'MISSING_MEDICINES' });
  }

  const normalizedMedicines = normalizedType === 'reimbursement' ? [] : (medicines ?? []);
  const normalizedPharmacyId = pharmacyId || undefined;

  const [doctorProfile, patientProfile, pharmacyProfile] = await Promise.all([
    getUserProfile(user.uid),
    getUserProfile(patientId),
    normalizedPharmacyId ? getUserProfile(normalizedPharmacyId) : Promise.resolve(null),
  ]);
  const doctorSignature = doctorProfile?.signatureDataUrl;
  if (!doctorSignature) {
    return res.status(400).json({ error: 'MISSING_SIGNATURE' });
  }
  const doctorDisplayName = buildDisplayName(doctorProfile, doctorName || 'Doctor');
  const patientDisplayName = buildDisplayName(patientProfile, patientName || 'Patient');
  const pharmacyDisplayName = normalizedType === 'standard'
    ? (pharmacyProfile?.pharmacyName ?? normalizedPharmacyName)
    : normalizedPharmacyName;
  const prescriptionInput: PrescriptionInput = {
    doctorId: user.uid,
    doctorName: doctorDisplayName,
    patientId,
    patientName: patientDisplayName,
    type: normalizedType,
    ...(reimbursementCode !== undefined ? { reimbursementCode } : {}),
    medicines: normalizedMedicines,
    ...(normalizedPharmacyId !== undefined ? { pharmacyId: normalizedPharmacyId } : {}),
    ...(pharmacyDisplayName !== undefined ? { pharmacyName: pharmacyDisplayName } : {}),
    ...(normalizedType === 'standard' && dosage !== undefined ? { dosage } : {}),
    ...(normalizedType === 'standard' && notes !== undefined ? { notes } : {}),
    ...(normalizedType === 'standard' && title !== undefined ? { title } : {}),
    signatureDataUrl: doctorSignature,
  };
  const prescription = await createPrescription(prescriptionInput);
  res.status(201).json(prescription);
});

router.patch('/:id/status', requireAuth([UserRole.Pharmacy, UserRole.Doctor, UserRole.Admin]), async (req, res) => {
  const { id } = req.params as { id: string };
  const requestPayload = validateBody(res, updatePrescriptionStatusSchema, req.body, 'MISSING_STATUS');
  if (!requestPayload) return;
  const status = requestPayload.status;
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
